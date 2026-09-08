# Event Management & Ticketing Platform (Sprint 1 & 2)

This project contains the foundational backend modules for the Event Management & Ticketing Platform.

## Tech Stack
- Node.js + Express.js
- MongoDB via Mongoose
- JSON Web Token (JWT) + bcrypt
- express-validator
- qrcode

## Setup Instructions

1. Run `npm install` to install dependencies.
2. Copy `.env.example` to `.env` and configure `MONGO_URI` and `JWT_SECRET`.
3. Run `node server.js` to start the server.

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

### Module 3: Ticket Categories
| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| POST | `/api/events/:eventId/categories` | Yes (Organizer, Owner) | Add a ticket category to an event. |
| GET | `/api/events/:eventId/categories` | No | List all ticket categories for an event. |
| PUT | `/api/categories/:id` | Yes (Organizer, Owner) | Update a ticket category. |
| DELETE | `/api/categories/:id` | Yes (Organizer, Owner) | Delete a ticket category. |

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

### API Endpoints
| Method | Endpoint | Authentication | Role | Purpose |
|--------|----------|----------------|------|---------|
| POST | `/api/bookings` | Yes | Any | Create a new booking |
| GET | `/api/bookings/:id` | Yes | Attendee/Org | View specific booking |
| GET | `/api/bookings/reference/:referenceCode` | Yes | Organizer/Admin | Find booking for check-in |
| PUT | `/api/bookings/:id/cancel` | Yes | Attendee | Cancel own booking |
| PUT | `/api/bookings/:id/checkin` | Yes | Organizer/Admin | Check in a booking |

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

