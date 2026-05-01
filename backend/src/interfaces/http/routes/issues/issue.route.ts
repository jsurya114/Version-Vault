import { Router, Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { IssueController } from '../../controllers/issues/IssueController';
import { authMiddleware } from '../../middleware/AuthMiddleware';

import { visibilityMiddleware } from '../../middleware/visibilityMiddleware';
import { writeAccessMiddleware } from '../../middleware/WriteAccessMiddleware';

const router = Router();
const issueController = (): IssueController => container.resolve(IssueController);

// GET /vv/issues/:username/:reponame — list issues
router.get(
  '/:username/:reponame',
  visibilityMiddleware,
  (req: Request, res: Response, next: NextFunction) => issueController().list(req, res, next),
);

// GET /vv/issues/:username/:reponame/:id — get single issue
router.get(
  '/:username/:reponame/:id',
  visibilityMiddleware,
  (req: Request, res: Response, next: NextFunction) => issueController().getOne(req, res, next),
);

// POST /vv/issues/:username/:reponame — create issue (auth required)
router.post(
  '/:username/:reponame',
  authMiddleware,
  writeAccessMiddleware,
  (req: Request, res: Response, next: NextFunction) => issueController().create(req, res, next),
);

// PATCH /vv/issues/:username/:reponame/:id/close — close issue (auth required)
router.patch(
  '/:username/:reponame/:id/close',
  authMiddleware,
  writeAccessMiddleware,
  (req: Request, res: Response, next: NextFunction) => issueController().close(req, res, next),
);

export default router;
