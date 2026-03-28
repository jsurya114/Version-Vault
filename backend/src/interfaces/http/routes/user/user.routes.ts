import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthRequest, UserController } from '../../controllers/user/UserController';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { upload } from '../../middleware/UploadMiddleware';

const router = Router();
const userController = container.resolve(UserController);

/**
 * User Routes
 * Base path: /vv/user
 */

// Public profile access (Anyone can view any username)
router.get('/:username', (req, res, next) => userController.getPublicProfile(req, res, next));

// Private profile editing (Only authenticated users can edit their own profile)
router.patch(
  '/profile',
  authMiddleware,
  upload.single('avatar'), // Multer looks for a field named 'avatar'
  (req, res, next) => userController.updateProfile(req as AuthRequest, res, next),
);

export default router;
