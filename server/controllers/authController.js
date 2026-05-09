const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Please provide name, email and password', 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email already registered', 400);
    }

    const userCount = await User.countDocuments();
    const user = await User.create({ name, email, password, role: userCount === 0 ? 'admin' : 'member' });
    const token = generateToken(user._id);

    return successResponse(res, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor,
        initials: user.getInitials()
      },
      token
    }, 'Account created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user._id);

    return successResponse(res, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor,
        initials: user.getInitials()
      },
      token
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    return successResponse(res, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor,
        initials: user.getInitials(),
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);

    if (name) {
      user.name = name;
      await user.save();
    }

    return successResponse(res, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor,
        initials: user.getInitials()
      }
    }, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getMe, updateProfile };
