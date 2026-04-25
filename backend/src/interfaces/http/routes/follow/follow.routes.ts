import { Router, Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { FollowController } from '../../controllers/follow/FollowController';
import { authMiddleware } from '../../middleware/AuthMiddleware';

const router = Router();
const followController = (): FollowController => container.resolve(FollowController);

router.post('/:userId', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  followController().follow(req, res, next),
);

router.delete('/:userId', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  followController().unfollow(req, res, next),
);

router.get('/:userId/followers', (req: Request, res: Response, next: NextFunction) =>
  followController().getFollowers(req, res, next),
);

router.get('/:userId/following', (req: Request, res: Response, next: NextFunction) =>
  followController().getFollowing(req, res, next),
);

export default router;
