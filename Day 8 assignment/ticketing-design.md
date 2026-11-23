# ticketing-design.md

# TicketHub System Design

## 1. Context

TicketHub is an online platform for purchasing tickets to concerts and live events.

The primary challenge is handling extreme demand during major ticket releases while ensuring:

- Fair access for customers
- Zero double-booking
- High availability
- Fast purchasing experience

Target audience:

- 2 million registered users
- 50,000 daily visitors
- Large-scale concert releases attracting up to 200,000 buyers in minutes

---

# 2. Goals and Non-Goals

## Goals

TicketHub must:

- Allow customers to browse events and seats
- Reserve seats temporarily
- Process payments securely
- Deliver digital tickets
- Prevent double-booking
- Scale for major sales events
- Provide fair access during high demand

## Non-Goals

TicketHub will not:

- Build its own payment processor
- Support ticket resale marketplaces
- Manage venue operations
- Implement dynamic pricing in Version 1

---

# 3. Requirements and Estimates

## Functional Requirements

Customers can:

1. Browse events
2. View event details
3. View seat availability
4. Hold seats temporarily
5. Purchase tickets
6. View purchased tickets

Administrators can:

1. Create events
2. Manage inventory
3. Monitor ticket sales

---

## Non-Functional Requirements

### Performance

| Metric | Target |
|----------|---------|
| Event page load | < 500 ms |
| Seat lookup | < 1 second |
| Seat hold creation | < 300 ms |
| Order creation | < 500 ms |

### Correctness

- Double-booking rate = **0%**
- Orders and payments remain consistent
- Seat inventory remains accurate

### Availability

- 99.95% uptime

### Fairness

- First-come-first-served access
- Virtual waiting room during major sales
- Rate limiting and bot protection
- Consistent hold times for all customers

### Scalability

- Support horizontal scaling
- Handle major sales without service interruption

---

## Traffic Estimates

### Normal Day

Assumptions:

```text
50,000 visitors/day
10 pages per visitor
5,000 tickets sold/day
```

Traffic:

```text
500,000 page views/day
≈ 6 RPS average
```

Planned capacity:

```text
20–50 RPS
```

---

### Major Concert Sale

Assumptions:

```text
200,000 buyers
20,000 seats
10-minute launch window
```

Traffic:

```text
2,000,000 requests
≈ 3,333 RPS
```

Planned capacity:

```text
4,000 RPS
```

Demand exceeds supply by:

```text
10:1
```

---

## Capacity Comparison

| Metric | Normal | Big Sale |
|----------|----------|----------|
| Visitors | 50,000/day | 200,000/10 min |
| Requests/sec | 20-50 | ~4,000 |
| Ticket Sales | 5,000/day | 20,000 seats |
| Purchase Attempts/sec | 1-5 | ~333 |

---

# 4. Proposed Design

## API Design

### Browse Events

```http
GET /api/v1/events
```

### Event Details

```http
GET /api/v1/events/{eventId}
```

### View Seats

```http
GET /api/v1/events/{eventId}/seats
```

### Create Seat Hold

```http
POST /api/v1/seat-holds
```

Creates a temporary reservation.

### Create Order

```http
POST /api/v1/orders
```

Converts a valid hold into an order.

### Process Payment

```http
POST /api/v1/payments
```

Completes checkout.

### View Tickets

```http
GET /api/v1/tickets
```

Returns purchased tickets.

---

## Idempotency

Purchase-related requests require:

```http
Idempotency-Key
```

If a request is retried due to timeout or network failure:

```text
One order is created.
One payment is processed.
```

This prevents duplicate charges and duplicate orders.

Applies to:

```text
POST /seat-holds
POST /orders
POST /payments
```

---

## Error Handling

Standard format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Description"
  }
}
```

Key responses:

```http
400 Bad Request
401 Unauthorized
409 Conflict
429 Too Many Requests
500 Internal Server Error
```

---

## Data Model

### Users

```text
user_id (PK)
email
password_hash
created_at
```

---

### Events

```text
event_id (PK)
name
venue
event_date
status
```

---

### Seats

```text
seat_id (PK)
event_id (FK)
section
seat_number
status
```

Status:

```text
AVAILABLE
HELD
SOLD
```

---

### Orders

```text
order_id (PK)
user_id (FK)
seat_id (FK)
status
amount
created_at
```

Status:

```text
PENDING_PAYMENT
CONFIRMED
CANCELLED
```

---

## Relationships

```text
User 1:N Orders
Event 1:N Seats
Seat 1:1 Confirmed Order
```

---

## Preventing Double-Booking

TicketHub uses three layers of protection:

### 1. Seat Holds

```text
Available
→ Held
→ Sold
```

Seats are reserved temporarily during checkout.

### 2. Database Transactions

```sql
SELECT ... FOR UPDATE
```

locks a seat during reservation.

Only one transaction can reserve a seat at a time.

### 3. Unique Constraint

```sql
UNIQUE(event_id, seat_id)
```

for confirmed purchases.

Business outcome:

```text
One Seat = One Customer
```

Target:

```text
0% double-booking
```

---

# Architecture

## Architecture Diagram

```text
Customers
    |
    v
+---------------+
| Virtual Queue |
+---------------+
        |
        v
+---------------+
| Load Balancer |
+---------------+
        |
        v
+----------------------+
| Application Servers  |
| (Node.js + Express)  |
+----------------------+
      |          |
      v          v
+---------+  +------------+
| Redis   |  | PostgreSQL |
+---------+  +------------+
                  |
                  v
          +--------------+
          | Read Replica |
          +--------------+
                  |
                  v
          +--------------+
          | Payment API  |
          +--------------+
```

---

## Component Roles

| Component | Purpose |
|------------|---------|
| Virtual Queue | Controls flash-sale demand |
| Load Balancer | Distributes traffic |
| App Servers | Business logic and APIs |
| Redis | Fast caching |
| PostgreSQL | Transactions and inventory |
| Read Replica | Browsing and reporting |
| Payment Provider | Payment processing |

---

## Surviving the Big Sale

The architecture survives large sales by:

- Queueing excess traffic
- Scaling application servers horizontally
- Caching common requests in Redis
- Separating reads from writes
- Using transactional seat reservation

Designed capacity:

```text
4,000 RPS
200,000 simultaneous buyers
```

---

# 5. Alternatives Considered

## Alternative 1: Optimistic Locking

### Advantage

Higher throughput.

### Disadvantage

More conflicts and retries.

### Decision

Not selected because ticket sales prioritize correctness over throughput.

---

## Alternative 2: No Seat Holds

### Advantage

Simpler implementation.

### Disadvantage

Users may pay for seats that become unavailable.

### Decision

Not selected because it creates a poor customer experience.

---

# 6. Risks and Open Questions

## Risks

### Payment Provider Failure

Mitigation:

- Retry logic
- Idempotency keys

### Bot Traffic

Mitigation:

- Rate limiting
- CAPTCHA
- Waiting room

### Database Hotspots

Mitigation:

- Short transactions
- Caching
- Queue management

---

## Open Questions

1. What is the optimal seat-hold duration?
2. Should queue admission be strictly first-come-first-served or randomized?
3. Should ticket transfers be supported in future releases?

---

# Technology Alignment

| Layer | Technology |
|---------|------------|
| Frontend | React |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Cache | Redis |
| Payments | Third-party provider |

This design prioritizes correctness, fairness, and scalability while providing a clear implementation path using React, Node.js, Express, and PostgreSQL.