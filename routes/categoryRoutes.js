const express = require('express');
const router = express.Router({ mergeParams: true }); // Important for /api/events/:eventId/categories
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const categoryValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  body('quota').isInt({ gt: 0 }).withMessage('Quota must be greater than 0'),
];

// POST /api/events/:eventId/categories
// GET /api/events/:eventId/categories
// PUT /api/categories/:id
// DELETE /api/categories/:id

// We'll export a function to mount these correctly in server.js
// Or we can just use the router based on how it's mounted.
// We'll handle mounting in server.js carefully.

// Routes for /api/categories/:id
const rootRouter = express.Router();
rootRouter.put('/:id', protect, requireRole('organizer'), categoryValidation, validate, updateCategory);
rootRouter.delete('/:id', protect, requireRole('organizer'), deleteCategory);

// Routes for /api/events/:eventId/categories
router.get('/', getCategories);
router.post('/', protect, requireRole('organizer'), categoryValidation, validate, createCategory);

module.exports = {
  eventCategoryRouter: router,
  categoryRouter: rootRouter,
};
