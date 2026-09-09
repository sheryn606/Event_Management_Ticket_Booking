# Event Management & Ticket Booking System

A full-stack Event Management & Ticket Booking application built with Node.js, Express.js, MongoDB, and Mongoose.

The system allows attendees to discover events, book tickets, view booking history, cancel bookings, and join waitlists. Organizers can create and manage events, manage ticket categories, perform check-ins, and view sales dashboards. Administrators can approve or reject events and access administrative functions.

---

## Team Details

**Project:** Event Management & Ticket Booking System  
**Domain:** Events & Entertainment

| Name | Roll Number | Role |
|---|---|---|
| Sheryn Anand | 2462148 |User Registration & Authentication, Ticket Creation Module,
Ticket Assignment Engine, Ticket Status Workflow |
| Sherwin Richard Ranjith | 2462190 | SLA Deadline Calculation, SLA Breach Flagging, Comment/Reply
Thread, Internal Notes Module |
| Shomik Sahu | 2462191 |  Escalation Workflow, Category & Priority Management, Customer
Satisfaction Rating, Agent Workload Dashboard, Manager Reports & Analytics,Database schema design, Postman testing, README, and PPT consolidation |
| 

> Replace the placeholders above with the final team information before submission.

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT
- **Password Security:** bcrypt
- **Validation:** express-validator
- **QR Generation:** qrcode
- **Frontend:** HTML, CSS, JavaScript
- **API Testing:** Postman

---

## Features

The project implements the required event-management workflow:

1. User Registration & Authentication
2. Event Creation & Management
3. Ticket Category Management
4. Event Discovery & Search
5. Ticket Booking
6. Booking Confirmation & QR Reference
7. Cancellation & Refund
8. Booking Check-In
9. Attendee Booking History
10. Event Approval Workflow
11. Waitlist Management
12. Organizer Sales Dashboard
13. Role-Based Access Control (RBAC)

---

## User Roles

### Attendee
- Register and log in
- Browse approved events
- View ticket categories
- Book tickets
- View booking history
- Cancel eligible bookings
- Join and view waitlists

### Organizer
- Create events
- Update and delete owned events
- Create and manage ticket categories
- View sales and attendance information
- Check in bookings belonging to owned events

### Admin
- Approve or reject pending events
- Perform authorized check-in operations
- Access organizer dashboards
- Access authorized booking information

---

## Project Structure

```text
Event_Management_Ticket_Booking/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── bookingController.js
│   ├── categoryController.js
│   ├── eventController.js
│   ├── organizerController.js
│   └── waitlistController.js
│
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validate.js
│
├── models/
│   ├── User.js
│   ├── Event.js
│   ├── TicketCategory.js
│   ├── Booking.js
│   └── Waitlist.js
│
├── routes/
│   ├── authRoutes.js
│   ├── bookingRoutes.js
│   ├── categoryRoutes.js
│   ├── eventRoutes.js
│   ├── organizerRoutes.js
│   └── waitlistRoutes.js
│
├── frontend/
│   ├── app.js
│   ├── dashboard.html
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── style.css
│
├── .env.example
├── package.json
├── package-lock.json
├── server.js
└── README.md