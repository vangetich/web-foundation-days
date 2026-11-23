# QuickNotes Architecture

## Overview

QuickNotes is a note-taking application that allows authenticated users to create, organize, tag, search, and retrieve notes. Because users read notes more frequently than they create or update them, the system is designed as a read-heavy architecture with caching and read replicas to improve performance and scalability.

---

# 1. Functional Requirements

The system must support the following functionality:

### User Management

- Register new users
- Authenticate users
- Manage user profiles

### Notes

- Create notes
- View notes
- Update notes
- Delete notes
- Categorize notes
- Search notes

### Tags

- Create tags
- Assign tags to notes
- Remove tags from notes
- Search notes by tag

### API

- REST-based API
- JSON request and response formats
- Authentication using bearer tokens

---

# 2. Non-Functional Requirements

### Availability

The system should remain available even if individual servers fail.

### Scalability

The system should be able to grow from thousands to millions of users without major redesign.

### Performance

- Low-latency note retrieval
- Fast note creation
- Cached responses for frequently accessed data

### Reliability

- Durable note storage
- Backup and recovery support

### Security

- Authentication and authorization
- Encrypted communication using HTTPS
- Password hashing

### Maintainability

- Independent scaling of services
- Clear separation of responsibilities

---

# 3. Load Estimates (1 Million Users)

Assumptions:

- Registered users: 1,000,000
- Daily active users (10%): 100,000
- Each active user creates 1 note per day
- Each active user reads 20 notes per day
- Average note size: 2 KB
- Peak traffic = 5× average traffic

---

## Writes Per Day

```text
100,000 users × 1 note/day
= 100,000 writes/day
```

### Average Writes Per Second

```text
100,000 / 86,400
≈ 1.16 writes/sec
≈ 2 writes/sec
```

### Peak Writes Per Second

```text
1.16 × 5
≈ 5.8 writes/sec
≈ 6 writes/sec
```

---

## Reads Per Day

```text
100,000 users × 20 reads/day
= 2,000,000 reads/day
```

### Average Reads Per Second

```text
2,000,000 / 86,400
≈ 23.15 reads/sec
≈ 23 reads/sec
```

### Peak Reads Per Second

```text
23.15 × 5
≈ 115.75 reads/sec
≈ 116 reads/sec
```

---

## Storage Per Year

### Notes Per Year

```text
100,000 × 365
= 36,500,000 notes
```

### Annual Storage

```text
36,500,000 × 2 KB
= 73,000,000 KB
≈ 73 GB/year
```

Allowing for indexes, metadata, backups, and growth:

```text
Estimated storage requirement:
100-150 GB per year
```

---

## Capacity Summary

| Metric | Estimate |
|----------|----------|
| Daily Active Users | 100,000 |
| Average Reads/sec | 23 |
| Peak Reads/sec | 116 |
| Average Writes/sec | 2 |
| Peak Writes/sec | 6 |
| Storage/Year | ~73 GB |
| Practical Storage Budget | 100-150 GB |

---

# 4. Architecture Diagram

```text
                           +-----------+
                           |  Clients  |
                           +-----+-----+
                                 |
                                 v
                           +-----------+
                           |    DNS    |
                           +-----+-----+
                                 |
                                 v
                           +-----------+
                           |    CDN    |
                           +-----+-----+
                                 |
                                 v
                     +----------------------+
                     |    Load Balancer     |
                     +----------+-----------+
                                |
                +---------------+---------------+
                |                               |
                v                               v
         +-------------+                 +-------------+
         | App Server 1|                 | App Server 2|
         +------+------+                 +------+------+
                |                               |
                +---------------+---------------+
                                |
                +---------------+---------------+
                |                               |
                v                               v
          +------------+                +---------------+
          |   Redis    |                |  Primary DB   |
          |   Cache    |                +-------+-------+
          +------------+                        |
                                                |
                                                v
                                       +----------------+
                                       | Read Replica   |
                                       +----------------+

                                |
                                v

                         +---------------+
                         |     Queue     |
                         +-------+-------+
                                 |
                                 v
                         +---------------+
                         |    Worker     |
                         +---------------+
```

---

# 5. Component Explanations

### Clients

Clients provide the web or mobile interface through which users interact with QuickNotes.

### DNS

DNS converts the application domain name into the network address of the platform.

### CDN

The CDN caches static assets and reduces latency for users in different geographic locations.

### Load Balancer

The load balancer distributes incoming traffic across multiple application servers to prevent overload.

### App Servers

Application servers handle authentication, business logic, API requests, and database interactions.

### Redis Cache

Redis stores frequently requested note data and search results to reduce database load.

### Primary Database

The primary database handles all write operations and stores the source of truth.

### Read Replica

The read replica serves read requests and reduces pressure on the primary database.

### Queue

The queue enables asynchronous processing without blocking user requests.

### Worker

Workers execute background tasks such as search indexing, notifications, analytics, and cleanup jobs.

---

# 6. GET /notes Request Flow

### Step 1

The client sends a GET /notes request.

### Step 2

DNS resolves the QuickNotes domain.

### Step 3

The request reaches the Load Balancer.

### Step 4

The Load Balancer forwards the request to an available App Server.

### Step 5

The App Server validates the authentication token.

### Step 6

The App Server checks Redis Cache for the requested note list.

### Step 7

If cached data exists, it is returned immediately.

### Step 8

If no cache entry exists, the App Server queries the Read Replica.

### Step 9

The results are returned to the App Server.

### Step 10

The App Server stores the results in Redis for future requests.

### Step 11

The note list is returned to the client.

---

# 7. POST /notes Request Flow

### Step 1

The client sends a POST /notes request.

### Step 2

DNS resolves the QuickNotes domain.

### Step 3

The request reaches the Load Balancer.

### Step 4

The Load Balancer forwards the request to an App Server.

### Step 5

The App Server validates authentication and request data.

### Step 6

The App Server writes the new note to the Primary Database.

### Step 7

The database confirms the transaction.

### Step 8

The App Server invalidates or updates relevant cache entries.

### Step 9

A background event may be added to the Queue for indexing or analytics processing.

### Step 10

The App Server returns a successful response to the client.

### Step 11

A Worker processes queued background tasks asynchronously.

---

# 8. Trade-Offs

## Trade-Off 1: Cache Freshness vs Performance

Caching significantly reduces database traffic and improves response times. However, cached note data may occasionally become slightly stale until cache entries are refreshed or invalidated.

---

## Trade-Off 2: Read Replicas vs Consistency

Read replicas improve scalability for read operations but may lag behind the primary database. Immediately after creating a note, a user may briefly see older data when reading from a replica.

---

## Trade-Off 3: Asynchronous Processing vs Simplicity

Background queues improve application responsiveness and scalability but introduce additional infrastructure and operational complexity.

---

# 9. Avoiding Single Points of Failure

The architecture minimizes single points of failure through redundancy and horizontal scaling.

### Application Layer

Multiple application servers are deployed so requests continue to succeed if one server fails.

### Database Layer

The read replica provides redundancy and can be promoted if the primary database becomes unavailable.

### Cache Layer

Redis can be deployed using replication and automatic failover.

### Queue Layer

Queue systems can run with multiple brokers and replicated message storage.

### Load Balancer Layer

Multiple load balancer instances can be deployed behind managed DNS services.

### Infrastructure Layer

Servers are distributed across multiple availability zones to reduce the impact of data center failures.

---

# Conclusion

QuickNotes is a read-heavy system that benefits from caching, read replicas, and asynchronous processing. The proposed architecture supports approximately 100,000 daily active users from a population of one million registered users while maintaining low latency, high availability, and future scalability. Redundant application servers, replicated databases, distributed caches, and queue-based processing help eliminate single points of failure and ensure reliable operation as user growth continues.