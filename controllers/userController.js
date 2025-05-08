import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc   Register new user
// @route  POST /api/users/register
// @access Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name,
    email,
    password
  });

  if (user) {
    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc   Auth user & get token
// @route  POST /api/users/login
// @access Public
export const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc   Get user profile
// @route  GET /api/users/profile
// @access Private
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
