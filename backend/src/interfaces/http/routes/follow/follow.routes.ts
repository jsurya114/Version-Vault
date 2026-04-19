import { Router } from 'express';
import { container } from 'tsyringe';
import { FollowController } from '../../controllers/follow/FollowController';
import { authMiddleware } from '../../middleware/AuthMiddleware';

const router = Router();
const followController = (): FollowController => container.resolve(FollowController);

router.post('/:userId', authMiddleware, (req, res, next) =>
  followController().follow(req, res, next),
);

router.delete('/:userId', authMiddleware, (req, res, next) =>
  followController().unfollow(req, res, next),
);

router.get('/:userId/followers', (req, res, next) =>
  followController().getFollowers(req, res, next),
);

router.get('/:userId/following', (req, res, next) =>
  followController().getFollowing(req, res, next),
);

export default router;
