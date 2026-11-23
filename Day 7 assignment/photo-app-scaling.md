# SnapShare Scaling Plan

## Overview

SnapShare is a photo-sharing application where users upload photos and browse a feed containing photos from people they follow. This document estimates system scale requirements and proposes a scalable architecture.

---

# 1. Assumptions

Given:

- Registered users: 10,000,000
- Daily active users (DAU): 10% of registered users
- Each active user uploads 1 photo per day
- Each active user views 50 feed pages per day
- Average photo size: 2 MB
- Thumbnail size: 50 KB
- Peak traffic is estimated as 5× average traffic
- 1 day = 86,400 seconds
- 1 year = 365 days

### Daily Active Users Calculation

DAU = 10,000,000 × 10%

DAU = 1,000,000 users

---

# 2. Capacity Estimates

## Uploads Per Day

Uploads per day = DAU × uploads per user

= 1,000,000 × 1

= 1,000,000 uploads/day

### Average Uploads Per Second

Uploads/sec = 1,000,000 / 86,400

≈ 11.57 uploads/sec

≈ 12 uploads/sec

### Peak Uploads Per Second

Peak uploads/sec = 11.57 × 5

≈ 57.87 uploads/sec

≈ 58 uploads/sec

---

## Feed Views Per Day

Feed views/day = DAU × feed pages viewed per user

= 1,000,000 × 50

= 50,000,000 feed views/day

### Average Feed Views Per Second

Feed views/sec = 50,000,000 / 86,400

≈ 578.70 views/sec

≈ 579 views/sec

### Peak Feed Views Per Second

Peak views/sec = 578.70 × 5

≈ 2,893.5 views/sec

≈ 2,894 views/sec

---

## Storage Per Year

### Photos Uploaded Per Year

Photos/year = 1,000,000 × 365

= 365,000,000 photos

### Storage Per Photo

Original photo = 2 MB

Thumbnail = 50 KB = 0.05 MB

Total per upload = 2.05 MB

### Total Annual Storage

365,000,000 × 2.05 MB

= 748,250,000 MB

= 748,250 GB

≈ 748.25 TB per year

### Summary

| Metric | Value |
|----------|----------|
| Daily Active Users | 1,000,000 |
| Uploads/sec (average) | 12 |
| Uploads/sec (peak) | 58 |
| Feed views/sec (average) | 579 |
| Feed views/sec (peak) | 2,894 |
| Storage/year | ~748 TB |

---

# 3. Read-Heavy vs Write-Heavy

SnapShare is a **read-heavy system**.

Reason:

- Users generate 1,000,000 uploads per day.
- Users generate 50,000,000 feed views per day.
- Feed reads are 50 times more frequent than uploads.

### Design Implications

Because reads greatly outnumber writes:

- Use caching to reduce database load.
- Use read replicas to scale database reads.
- Use a CDN to serve images closer to users.
- Optimize feed retrieval speed.
- Scale read infrastructure more aggressively than write infrastructure.

---

# 4. Why Photos Should Not Be Stored in the Database

Large image files should not be stored directly inside the relational database because:

- Databases are expensive for storing large binary files.
- Large files increase backup and restore times.
- Database performance degrades when storing huge media objects.
- Scaling file storage inside a database is difficult.

Instead:

- Store photo binaries in an Object Storage service (for example Amazon S3, Azure Blob Storage, or Google Cloud Storage).
- Store only metadata and file URLs in the database.

---

# 5. Architecture Diagram

```text
                      +-------------+
                      |    Users    |
                      +------+------+ 
                             |
                             v
                      +-------------+
                      |     CDN     |
                      +------+------+
                             |
                             v
                     +--------------+
                     | Load Balancer|
                     +------+-------+
                            |
          +-----------------+------------------+
          |                                    |
          v                                    v
    +-----------+                        +-----------+
    | App Server|                        | App Server|
    +-----+-----+                        +-----+-----+
          |                                    |
          +----------------+-------------------+
                           |
              +------------+-----------+
              |                        |
              v                        v
      +--------------+        +----------------+
      |    Cache     |        | Primary DB     |
      |   (Redis)    |        +--------+-------+
      +------+-------+                 |
             |                         |
             |                         v
             |                +----------------+
             |                | Read Replica   |
             |                +----------------+
             |
             v
      +----------------+
      | Object Storage |
      |   (Photos)     |
      +--------+-------+
               |
               v
         +-----------+
         |   Queue   |
         +-----+-----+
               |
               v
         +-----------+
         |  Worker   |
         |Thumbnailer|
         +-----+-----+
               |
               v
      +----------------+
      | Object Storage |
      | (Thumbnails)   |
      +----------------+
```

---

# 6. Component Explanations

### CDN
Caches and delivers photos from locations near users to reduce latency and bandwidth usage.

### Load Balancer
Distributes incoming requests across multiple application servers to prevent overload.

### App Servers
Handle user requests, business logic, authentication, uploads, and feed generation.

### Cache (Redis)
Stores frequently requested feed data and metadata to reduce database reads.

### Primary Database
Stores user profiles, follow relationships, photo metadata, and application data.

### Read Replica
Provides additional read capacity for feed queries without impacting write performance.

### Object Storage
Stores original photo files reliably, cheaply, and at massive scale.

### Queue
Decouples background processing tasks from user-facing upload requests.

### Thumbnail Worker
Processes uploaded photos and generates thumbnail versions asynchronously.

---

# 7. Photo Upload Flow

### Step 1
The user uploads a photo through the mobile or web application.

### Step 2
The request reaches the Load Balancer, which routes it to an available App Server.

### Step 3
The App Server validates the request and user permissions.

### Step 4
The original photo is stored in Object Storage.

### Step 5
The App Server saves photo metadata and storage location information in the Primary Database.

### Step 6
The App Server places a thumbnail-generation job into the Queue.

### Step 7
The upload request returns success to the user immediately without waiting for thumbnail creation.

### Step 8
A Worker consumes the job from the Queue.

### Step 9
The Worker downloads the original image from Object Storage.

### Step 10
The Worker generates one or more thumbnails.

### Step 11
The generated thumbnails are uploaded back to Object Storage.

### Step 12
Thumbnail metadata is updated in the Database.

### Step 13
The CDN caches requested images and thumbnails as users view them.

---

# 8. Trade-Offs

## Trade-Off 1: Cache Freshness vs Performance

Using aggressive caching greatly improves feed response times and reduces database load; however, users may occasionally see slightly stale feed data.

## Trade-Off 2: Asynchronous Thumbnail Generation vs Immediate Availability

Generating thumbnails in the background improves upload speed and user experience but means thumbnails may not appear immediately after upload.

## Trade-Off 3: Read Replicas vs Data Consistency

Read replicas improve read scalability but may experience replication lag, causing recently uploaded photos to appear slightly later in some feeds.

## Trade-Off 4: CDN Cost vs Performance

A CDN significantly reduces latency and origin server load but increases infrastructure cost.

---

# Conclusion

SnapShare serves approximately 1 million daily active users, processes about 12 average uploads per second (58 peak), handles roughly 579 average feed views per second (2,894 peak), and requires approximately 748 TB of new storage annually. Because feed consumption vastly exceeds uploads, the system is read-heavy and should prioritize caching, CDNs, and read scaling through replicas while storing photos in object storage rather than the database.