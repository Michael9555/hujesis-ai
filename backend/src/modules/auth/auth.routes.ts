import { Router } from 'express';
import authController from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from './auth.schema';

const router = Router();

// Public routes
router.post(
  '/register',
  validate({ body: registerSchema }),
  authController.register.bind(authController)
);

router.post(
  '/login',
  validate({ body: loginSchema }),
  authController.login.bind(authController)
);

router.post(
  '/refresh-token',
  validate({ body: refreshTokenSchema }),
  authController.refreshToken.bind(authController)
);

router.post('/logout', authController.logout.bind(authController));

// Protected routes
router.get('/me', authenticate, authController.getMe.bind(authController));

router.post(
  '/logout-all',
  authenticate,
  authController.logoutAll.bind(authController)
);

router.post(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  authController.changePassword.bind(authController)
);

export default router;


