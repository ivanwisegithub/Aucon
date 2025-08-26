import express from 'express';
import { signup, signin, google, signout } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', google);
router.post('/signout', signout); // ✅ Now signout is properly imported

export default router;

router.get('/debug/token', (req, res) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token found in cookies'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({
      success: true,
      message: 'Token decoded successfully',
      decoded
    });
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      error: err.message
    });
  }
});
