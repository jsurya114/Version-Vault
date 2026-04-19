import { Router } from 'express';
import { container } from 'tsyringe';
import { NotificationController } from '../../controllers/notification/NotificationController';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { AuthRequest } from '../../controllers/user/UserController';

const router = Router();
const controller = (): NotificationController => container.resolve(NotificationController);

router.get('/', authMiddleware, (req, res, next) =>
  controller().list(req as AuthRequest, res, next),
);
router.get('/unread-count', authMiddleware, (req, res, next) =>
  controller().unreadCount(req as AuthRequest, res, next),
);
router.patch('/:id/read', authMiddleware, (req, res, next) =>
  controller().markRead(req, res, next),
);
router.patch('/read-all', authMiddleware, (req, res, next) =>
  controller().markAllRead(req as AuthRequest, res, next),
);

export default router;
