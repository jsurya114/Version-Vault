import { Router } from 'express';
import { container } from 'tsyringe';
import { PRController } from '../../controllers/pullrequest/PRController';
import { authMiddleware } from '../../middleware/AuthMiddleware';

const router = Router();
const prController = container.resolve(PRController);

// GET /vv/pr/:username/:reponame — list PRs
router.get('/:username/:reponame', (req, res, next) => prController.listPr(req, res, next));

// GET /vv/pr/:username/:reponame/:id — get single PR
router.get('/:username/:reponame/:id', (req, res, next) => prController.getPr(req, res, next));

// POST /vv/pr/:username/:reponame — create PR (auth required)
router.post('/:username/:reponame', authMiddleware, (req, res, next) =>
  prController.create(req, res, next),
);

// PATCH /vv/pr/:username/:reponame/:id/merge — merge PR (auth required)
router.patch('/:username/:reponame/:id/merge', authMiddleware, (req, res, next) =>
  prController.merge(req, res, next),
);

// PATCH /vv/pr/:username/:reponame/:id/close — close PR (auth required)
router.patch('/:username/:reponame/:id/close', authMiddleware, (req, res, next) =>
  prController.close(req, res, next),
);

export default router;
