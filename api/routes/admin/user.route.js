import express from 'express';
import {
  getAllUsers,
  promoteUser,
  deactivateUser
} from '../../controllers/admin/user.controller.js';
import verifyToken from '../../middleware/verifyToken.js';
import verifyAdmin from '../../middleware/verifyAdmin.js';

const router = express.Router();

// ✅ Apply protection to all admin user routes
router.use(verifyToken, verifyAdmin);

// ✅ Admin-only endpoints
router.get('/', getAllUsers); // GET /api/admin/users
router.put('/:id/promote', promoteUser); // PUT /api/admin/users/:id/promote
router.put('/:id/deactivate', deactivateUser); // PUT /api/admin/users/:id/deactivate

export default router;
