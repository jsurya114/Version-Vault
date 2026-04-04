import { Router } from 'express';
import { container } from 'tsyringe';
import { IssueController } from '../../controllers/issues/IssueController';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { ownerMiddleware } from '../../middleware/ownerMiddleware';
import { writeAccessMiddleware } from '../../middleware/WriteAccessMiddleware';

const router = Router();
const issueController = container.resolve(IssueController);

// GET /vv/issues/:username/:reponame — list issues
router.get('/:username/:reponame', (req, res, next) => issueController.list(req, res, next));

// GET /vv/issues/:username/:reponame/:id — get single issue
router.get('/:username/:reponame/:id', (req, res, next) => issueController.getOne(req, res, next));

// POST /vv/issues/:username/:reponame — create issue (auth required)
router.post('/:username/:reponame', authMiddleware, writeAccessMiddleware, (req, res, next) =>
  issueController.create(req, res, next),
);

// PATCH /vv/issues/:username/:reponame/:id/close — close issue (auth required)
router.patch('/:username/:reponame/:id/close', authMiddleware, writeAccessMiddleware, (req, res, next) =>
  issueController.close(req, res, next),
);

export default router;
