import { Router } from 'express';
import { container } from 'tsyringe';
import { CommentController } from '../../controllers/comment/CommentController';

// Middlewares
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { visibilityMiddleware } from '../../middleware/visibilityMiddleware';
import { repoAccessMiddleware } from '../../middleware/repoAccessMiddleware';

const router = Router();
const commentController = container.resolve(CommentController);

// CREATE Comment: User MUST be logged in (authMiddleware), then validated for repo permission (repoAccessMiddleware)
router.post(
  '/:username/:reponame/:targetType/:targetId',
  authMiddleware,
  repoAccessMiddleware,
  (req, res, next) => commentController.createComment(req, res, next),
);

// VIEW Comments: Let anyone try to view (visibilityMiddleware), but repoAccessMiddleware will block them if it's a private repo and they lack permissions.
router.get(
  '/:username/:reponame/:targetType/:targetId',
  visibilityMiddleware,
  repoAccessMiddleware,
  (req, res, next) => commentController.listComment(req, res, next),
);
// DELETE Comment: Strict auth check
router.delete('/:commentId', authMiddleware, (req, res, next) =>
  commentController.delete(req, res, next),
);

export default router;
