const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id, role) => {
  return jwt.sign({ userId: id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (Attendee or Organizer)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Do not allow self-registering as admin
    const assignedRole = role === 'organizer' ? 'organizer' : 'attendee';

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(409);
      const error = new Error('Email already exists');
      error.errorCode = 'DUPLICATE_EMAIL';
      return next(error);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: assignedRole,
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Record created successfully',
        data: {
          _id: user._id,
        },
      });
    } else {
      res.status(400);
      const error = new Error('Invalid user data');
      error.errorCode = 'VALIDATION_ERROR';
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token: generateToken(user._id, user.role),
        },
      });
    } else {
      res.status(401);
      const error = new Error('Invalid credentials');
      error.errorCode = 'UNAUTHORIZED';
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
