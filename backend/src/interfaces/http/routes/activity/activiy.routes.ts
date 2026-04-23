import { Router } from 'express';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { ActivityController } from '../../controllers/activity/ActivityController';
import { container } from 'tsyringe';
import { AuthRequest } from '../../controllers/repository/RepositoryController';

const activityController = (): ActivityController => container.resolve(ActivityController);
const router = Router();

router.get('/feed', authMiddleware, (req, res, next) =>
  activityController().getFeed(req as AuthRequest, res, next),
);

export default router;
