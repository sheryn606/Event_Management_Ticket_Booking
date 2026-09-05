# Event Management & Ticketing Platform (Sprint 1)

This project contains the foundational backend modules for the Event Management & Ticketing Platform: User Registration & Authentication, Event Creation & Management, Ticket Category Management, and Event Discovery.

## Tech Stack
- Node.js + Express.js
- MongoDB via Mongoose
- JSON Web Token (JWT) + bcrypt
- express-validator

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
