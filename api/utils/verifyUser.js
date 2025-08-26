// api/utils/verifyUser.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  let token = null;

  // 1. Try cookies
  if (req.cookies?.access_token) {
    token = req.cookies.access_token;
    console.log('✅ Token from cookie');
  }

  // 2. Authorization: Bearer <token>
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('✅ Token from Authorization header');
  }

  // 3. Fallback: x-access-token header
  else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
    console.log('✅ Token from x-access-token');
  }

  // 4. Last resort: request body
  else if (req.body?.token) {
    token = req.body.token;
    console.log('✅ Token from request body');
  }

  // ❌ No token
  if (!token) {
    console.log('⛔ No auth token found');
    return res.status(401).json({
      success: false,
      message: 'Authentication token not found. Please log in.'
    });
  }

  // 5. Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      isAdmin: decoded.isAdmin || false
    };
    next();
  } catch (err) {
    console.error('❌ JWT error:', err.message);

    const errorMap = {
      TokenExpiredError: 'Token has expired. Please log in again.',
      JsonWebTokenError: 'Invalid token. Please log in again.',
      NotBeforeError: 'Token not active yet. Please log in again.'
    };

    res.status(401).json({
      success: false,
      message: errorMap[err.name] || 'Authentication failed. Please log in.'
    });
  }
};

export default verifyToken;
