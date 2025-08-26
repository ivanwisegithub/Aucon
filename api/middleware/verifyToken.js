import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';

const verifyToken = (req, res, next) => {
  let token;

  // Check Authorization header first
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no Authorization header, check cookies
  if (!token && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token not found. Please login again.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach only the user object to req.user
    req.user = decoded.user || decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please login again.'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token. Please login again.'
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please login again.'
      });
    }
  }
};

export default verifyToken;
