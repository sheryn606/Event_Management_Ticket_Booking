# EventX — Event Management & Ticket Booking System

A backend-oriented event management and ticket booking system covering event creation and discovery, ticket-category management, authenticated booking, booking history, cancellation and refunds, check-in, event approval, waitlist management, organizer reporting, and role-based access control.

**Project Domain:** Events & Entertainment
**Sprint:** Sprint 3 (Final)

## Team Details

| Team Member Name | Roll No. |
| Sheryn Anand | 2462148 | 
| Sherwin Richard Ranjith | 2462190 | 
| Shomik Sahu | 2462191 | 

## Tech Stack
- Node.js + Express.js
- MongoDB via Mongoose
- JSON Web Token (JWT) + bcrypt
- express-validator
- qrcode
- Postman (API testing)

## Module List

| Module | Description |
|---|---|
| Authentication | Registration/login with JWT; bcrypt password hashing. |
| Event Management | Organizer creates, updates and deletes events; approval state is workflow-controlled. |
| Ticket Category | CRUD with price, quota and sold inventory. |
| Discovery / Search | Public search of approved events by filters. |
| Booking Engine | Authenticated attendee booking with atomic inventory update. |
| Confirmation / QR | Booking reference code and QR data generated at booking. |
| Cancellation / Refund | Cancellation window, refund state and inventory restoration. |
| Check-in | Organizer/admin check-in with ownership and state validation. |
| Booking History | Attendee history with populated event/category details. |
| Approval Workflow | Admin approves/rejects pending events; organizer cannot self-approve. |
| Waitlist | Attendee waitlist with duplicate prevention and promotion state. |
| Organizer Dashboard | Booking, ticket, revenue and status summaries. |
| RBAC | Attendee, Organizer and Admin permissions enforced by middleware. |

## Setup / Installation Steps

1. Run `npm install` to install dependencies.
2. Copy `.env.example` to `.env` and configure:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CANCELLATION_WINDOW_HOURS` (default: 24)
3. Run `node server.js` to start the server.
4. Import the Postman collection and the `Event Management Local` environment to test the API.

## API Reference

### Module 1: Auth
| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| POST | `/api/auth/register` | No | Register a new user (attendee or organizer). |
| POST | `/api/auth/login` | No | Login and get a JWT token. |

### Module 2: Events
| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| POST | `/api/events` | Yes (Organizer) | Create a new event. |
| GET | `/api/events/search` | No | Browse/search approved events (with pagination/filters). |
| GET | `/api/events/:id` | No | Fetch details of a single event. |
| PUT | `/api/events/:id` | Yes (Organizer, Owner) | Update an existing event. |
| DELETE | `/api/events/:id` | Yes (Organizer, Owner) | Delete/cancel an event. |
| PUT | `/api/events/:id/approve` | Yes (Admin) | Approve or reject a pending event. |

### Module 3: Ticket Categories
| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| POST | `/api/events/:eventId/categories` | Yes (Organizer, Owner) | Add a ticket category to an event. |
| GET | `/api/events/:eventId/categories` | No | List all ticket categories for an event. |
| PUT | `/api/categories/:id` | Yes (Organizer, Owner) | Update a ticket category. |
| DELETE | `/api/categories/:id` | Yes (Organizer, Owner) | Delete a ticket category. |

### Module 4: Bookings
| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| POST | `/api/bookings` | Yes (Attendee) | Create a new booking. |
| GET | `/api/bookings/history` | Yes (Attendee) | View own booking history (populated event/category details). |
| GET | `/api/bookings/:id` | Yes (Attendee/Organizer) | View a specific booking. |
| GET | `/api/bookings/reference/:referenceCode` | Yes (Organizer/Admin) | Find booking by reference code (for check-in). |
| PUT | `/api/bookings/:id/cancel` | Yes (Attendee) | Cancel own booking and trigger refund. |
| PUT | `/api/bookings/:id/checkin` | Yes (Organizer/Admin) | Check in a booking. |

### Module 5: Waitlist
| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| POST | `/api/waitlist` | Yes (Attendee) | Join the waitlist for an event/ticket category. |
| GET | `/api/waitlist` | Yes (Attendee) | View own waitlist entries. |

### Module 6: Organizer Dashboard
| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| GET | `/api/organizers/:id/dashboard` | Yes (Organizer, Owner) | View booking, ticket and revenue summary. |

---

## MEMBER 2 — SPRINT 2 HANDOFF

### Files Added
- `models/Booking.js`
- `controllers/bookingController.js`
- `routes/bookingRoutes.js`

### Files Modified
- `server.js` (mounted `/api/bookings`)
- `.env.example` (added `CANCELLATION_WINDOW_HOURS`)
- `README.md` (added Sprint 2 docs)
- `package.json` and `package-lock.json` (installed `qrcode`)

### Environment Changes
- Added `CANCELLATION_WINDOW_HOURS` (Default is 24).

### Database Changes
- Added `Booking` collection with references to Event, TicketCategory, and User.
- Indexes: `eventId`, `ticketCategoryId`, `attendeeId`, `referenceCode` (unique), `status`.
- Status values: `confirmed`, `cancelled`, `checked_in`.
- Refund fields: `refundStatus`, `refundAmount`.

### Important Business Rules
- **Overselling Prevention**: Inventory is atomically decremented during booking using a MongoDB conditional update `$expr: { $lte: [{ $add: ['$sold', quantity] }, '$quota'] }`. If booking document creation fails, a compensating update restores inventory.
- **Cancellation Window**: Bookings can only be cancelled up to `CANCELLATION_WINDOW_HOURS` before the event starts.
- **Inventory Restoration**: Cancelling a booking restores its `quantity` to the `sold` counter on `TicketCategory`.
- **Check-in Rules**: Only the `organizer` who owns the event (or an `admin`) can check in a booking. Attendees cannot.
- **QR Reference**: A unique `referenceCode` is generated per booking and exposed along with its QR Code data URI.

### Member 3 Handoff Notes
- **Booking History**: Query `Booking` by `attendeeId` and populate related fields to build the user's booking history.
- **Waitlist**: The waitlist logic can trigger when booking creation fails with `TICKETS_SOLD_OUT`. Cancellation restores inventory, which waitlist can then consume.
- **Sales Dashboard**: Aggregate `quantity` and `totalAmount` grouping by `eventId` or `ticketCategoryId` directly from the `Booking` collection.
- **RBAC**: Do not create a new roles structure; reuse `req.user.role` from the JWT middleware.

### Member 4 Handoff Notes
- Postman routes for Booking are provided below or in the exported Postman collection.
- All edge-cases tested (insufficient inventory, double cancellation, double check-in, unauthorized views, bad references).
- Database relationships cleanly separate Event, Category, Booking, and User documents.

---

## SPRINT 3 — Approval, Waitlist, Dashboard & RBAC

### Core Business Workflows

**Event Approval**
- Organizer creates an event; the backend forces its initial status to `pending`.
- Only an administrator can approve or reject the event.
- Only pending events can be reviewed; an already-approved event returns an `INVALID_STATE` conflict.
- Approved events become available for discovery and booking.

**Waitlist**
- An attendee joins a specific event/category waitlist.
- Duplicate waiting entries are rejected (unique compound index on attendee/event/category).
- Cancellation can promote a waiting entry and record its promoted state.
- Prototype limitation: promotion does not automatically create a booking or reserve inventory.

**Organizer Dashboard / RBAC**
- Dashboard aggregates booking, ticket and revenue summaries per organizer.
- Attendee, Organizer and Admin permissions are enforced by middleware; organizer ownership is checked before modifying resources or accessing organizer-specific reporting.

### Database Collections

| Collection | Key Fields | Purpose |
|---|---|---|
| `users` | name, email, passwordHash, role | Identity and RBAC |
| `events` | organizerId, title, venue, date, city, category, status | Organizer-owned event and approval state |
| `ticketcategories` | eventId, name, price, quota, sold | Ticket inventory |
| `bookings` | eventId, ticketCategoryId, attendeeId, quantity, totalAmount, referenceCode, status | Purchase/lifecycle record |
| `waitlist` | attendeeId, eventId, ticketCategoryId, requestedAt, status | Waiting entries |

### Known Limitations / Future Enhancements
- Waitlist promotion does not automatically create a booking or reserve inventory.
- Payment gateway integration and transaction records are out of scope.
- Email/SMS booking notifications are out of scope.
- Frontend is intentionally lightweight; core booking/check-in evidence is API-driven.
- Planned: richer organizer analytics and a more complete attendee ticket UI.

### Testing
The Postman collection covers authentication, event operations, ticket categories, booking lifecycle, waitlist, organizer dashboard, and RBAC negative tests — including happy-path, validation, authentication, authorization, business-rule, and not-found scenarios.
