import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

// ✅ Signup Controller
export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(errorHandler(400, 'All fields are required'));
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role: 'student' // Default role
  });

  try {
    await newUser.save();
    res.json({ success: true, message: 'Signup successful' });
  } catch (error) {
    next(error);
  }
};

// ✅ Signin Controller
export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(errorHandler(400, 'All fields are required'));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found'));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(400, 'Invalid password'));

    const token = jwt.sign(
      {
        id: validUser._id,
        email: validUser.email,
        isAdmin: validUser.role === 'admin' || validUser.isAdmin === true
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: pass, ...rest } = validUser._doc;

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Signin successful',
      user: rest,
      accessToken: token
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Google Auth Controller
export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      user = new User({
        username:
          name.toLowerCase().split(' ').join('') +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
        role: 'student'
      });

      await user.save();
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isAdmin: user.role === 'admin' || user.isAdmin === true
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password, ...rest } = user._doc;

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Google signin successful',
      user: rest,
      accessToken: token
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Signout Controller
export const signout = async (req, res, next) => {
  try {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
    });

    res.status(200).json({
      success: true,
      message: 'User has been signed out successfully'
    });
  } catch (error) {
    next(error);
  }
};
