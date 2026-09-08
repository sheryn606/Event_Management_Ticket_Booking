require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const { eventCategoryRouter, categoryRouter } = require('./routes/categoryRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Mount nested categories router
// We use a separate router for /api/events/:eventId/categories
app.use('/api/events/:eventId/categories', eventCategoryRouter);

// Mount root categories router for PUT and DELETE
app.use('/api/categories', categoryRouter);

// Mount booking router
app.use('/api/bookings', bookingRoutes);

// Centralized Error Handler (must be after all routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
