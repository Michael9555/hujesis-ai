import { Router } from 'express';
import userController from './user.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { updateProfileSchema } from './user.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/profile', userController.getProfile.bind(userController));

// Update profile
router.put(
  '/profile',
  validate({ body: updateProfileSchema }),
  userController.updateProfile.bind(userController)
);

// Get dashboard stats
router.get('/dashboard', userController.getDashboard.bind(userController));

// Delete account
router.delete('/account', userController.deleteAccount.bind(userController));

export default router;


