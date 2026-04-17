import { Router } from 'express';
import { container } from 'tsyringe';
import { PRController } from '../../controllers/pullrequest/PRController';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { ownerMiddleware } from '../../middleware/ownerMiddleware';
import { visibilityMiddleware } from '../../middleware/visibilityMiddleware';
import { writeAccessMiddleware } from '../../middleware/WriteAccessMiddleware';
import { AuthRequest } from '../../controllers/user/UserController';

const router = Router();
const prController = container.resolve(PRController);

// GET /vv/pr/:username/:reponame — list PRs
router.get('/:username/:reponame', visibilityMiddleware, (req, res, next) =>
  prController.listPr(req, res, next),
);

// GET /vv/pr/:username/:reponame/:id — get single PR
router.get('/:username/:reponame/:id', (req, res, next) => prController.getPr(req, res, next));

// POST /vv/pr/:username/:reponame — create PR (auth required)
router.post('/:username/:reponame', authMiddleware, writeAccessMiddleware, (req, res, next) =>
  prController.create(req, res, next),
);

// PATCH /vv/pr/:username/:reponame/:id/merge — merge PR (auth required)
router.patch('/:username/:reponame/:id/merge', authMiddleware, ownerMiddleware, (req, res, next) =>
  prController.merge(req, res, next),
);

// PATCH /vv/pr/:username/:reponame/:id/close — close PR (auth required)
router.patch(
  '/:username/:reponame/:id/close',
  authMiddleware,
  writeAccessMiddleware,
  (req, res, next) => prController.close(req, res, next),
);

// Collaborator requests merge (sends approval request to owner)
router.patch(
  '/:username/:reponame/:id/request-merge',
  authMiddleware,
  writeAccessMiddleware,
  (req, res, next) => prController.requestMerge(req, res, next),
);

// Owner approves and merges
router.patch(
  '/:username/:reponame/:id/approve-merge',
  authMiddleware,
  ownerMiddleware,
  (req, res, next) => prController.approveMerge(req, res, next),
);

// Owner rejects merge request
router.patch(
  '/:username/:reponame/:id/reject-merge',
  authMiddleware,
  ownerMiddleware,
  (req, res, next) => prController.rejectMerge(req, res, next),
);

// Keep existing merge route for owner's own PRs
router.patch('/:username/:reponame/:id/merge', authMiddleware, ownerMiddleware, (req, res, next) =>
  prController.merge(req, res, next),
);

// GET /vv/pr/:username/:reponame/:id/conflicts — get conflict details
router.get('/:username/:reponame/:id/conflicts', authMiddleware, (req, res, next) =>
  prController.getConflicts(req, res, next),
);
// POST /vv/pr/:username/:reponame/:id/resolve-conflicts — resolve conflicts and merge
router.post(
  '/:username/:reponame/:id/resolve-conflicts',
  authMiddleware,
  ownerMiddleware,
  (req, res, next) => prController.resolveConflicts(req as AuthRequest, res, next),
);

export default router;
