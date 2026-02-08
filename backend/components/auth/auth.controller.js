import { generateToken } from '../../middleware/auth.middleware.js';
import User from '../user/user.model.js';

const authController = {
  login: async (req, res) => {
    // login logic here
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
        statusCode: 400,
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        statusCode: 401,
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        statusCode: 401,
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
        },
        token,
      },
      message: 'Login successful',
    });
  },
  register: async (req, res, next) => {
    // registration logic here
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: req.body.email }, { username: req.body.username }],
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error:
            existingUser.email === req.body.email
              ? 'Email already in use'
              : 'Username already in use',
          statusCode: 400,
        });
      }

      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });

      await newUser.save();

      const { _id: id, username, email, profileImage } = newUser;

      const token = generateToken(id);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id,
            username,
            email,
            profileImage,
          },
          token,
        },
        message: 'User registered successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  getProfile: async (req, res, next) => {
    // get profile logic here
    try {
      const user = await User.findById(req.user._id).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          statusCode: 404,
        });
      }

      res.status(200).json({
        success: true,
        data: { ...user.toObject(), id: user._id },
        message: 'User profile fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  updateProfile: async (req, res, next) => {
    // update profile logic here
    const { username, email, profileImage } = req.body;

    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          statusCode: 404,
        });
      }

      if (username) user.username = username;
      if (email) user.email = email;
      if (profileImage) user.profileImage = profileImage;

      await user.save();

      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
        },
        message: 'User profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  changePassword: async (req, res) => {
    // change password logic here
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current and new password',
        statusCode: 400,
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect',
        statusCode: 401,
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  },
};

export const login = authController.login;
export const register = authController.register;
export const getProfile = authController.getProfile;
export const updateProfile = authController.updateProfile;
export const changePassword = authController.changePassword;
