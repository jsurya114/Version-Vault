import { Router, Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { NotificationController } from '../../controllers/notification/NotificationController';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { AuthRequest } from '../../controllers/user/UserController';

const router = Router();
const controller = (): NotificationController => container.resolve(NotificationController);

router.get('/', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  controller().list(req as AuthRequest, res, next),
);
router.get('/unread-count', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  controller().unreadCount(req as AuthRequest, res, next),
);
router.patch('/:id/read', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  controller().markRead(req, res, next),
);
router.patch('/read-all', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  controller().markAllRead(req as AuthRequest, res, next),
);

export default router;
