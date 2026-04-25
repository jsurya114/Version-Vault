import { Router, Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { PRController } from '../../controllers/pullrequest/PRController';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { ownerMiddleware } from '../../middleware/ownerMiddleware';
import { visibilityMiddleware } from '../../middleware/visibilityMiddleware';
import { writeAccessMiddleware } from '../../middleware/WriteAccessMiddleware';
import { AuthRequest } from '../../controllers/user/UserController';

const router = Router();
const prController = (): PRController => container.resolve(PRController);

// GET /vv/pr/:username/:reponame — list PRs
router.get('/:username/:reponame', visibilityMiddleware, (req: Request, res: Response, next: NextFunction) =>
  prController().listPr(req, res, next),
);

// GET /vv/pr/:username/:reponame/:id — get single PR
router.get('/:username/:reponame/:id', (req: Request, res: Response, next: NextFunction) => prController().getPr(req, res, next));

// POST /vv/pr/:username/:reponame — create PR (auth required)
router.post('/:username/:reponame', authMiddleware, writeAccessMiddleware, (req: Request, res: Response, next: NextFunction) =>
  prController().create(req, res, next),
);

// PATCH /vv/pr/:username/:reponame/:id/merge — merge PR (auth required)
router.patch('/:username/:reponame/:id/merge', authMiddleware, ownerMiddleware, (req: Request, res: Response, next: NextFunction) =>
  prController().merge(req, res, next),
);

// PATCH /vv/pr/:username/:reponame/:id/close — close PR (auth required)
router.patch(
  '/:username/:reponame/:id/close',
  authMiddleware,
  writeAccessMiddleware,
  (req: Request, res: Response, next: NextFunction) => prController().close(req, res, next),
);

// Collaborator requests merge (sends approval request to owner)
router.patch(
  '/:username/:reponame/:id/request-merge',
  authMiddleware,
  writeAccessMiddleware,
  (req: Request, res: Response, next: NextFunction) => prController().requestMerge(req, res, next),
);

// Owner approves and merges
router.patch(
  '/:username/:reponame/:id/approve-merge',
  authMiddleware,
  ownerMiddleware,
  (req: Request, res: Response, next: NextFunction) => prController().approveMerge(req, res, next),
);

// Owner rejects merge request
router.patch(
  '/:username/:reponame/:id/reject-merge',
  authMiddleware,
  ownerMiddleware,
  (req: Request, res: Response, next: NextFunction) => prController().rejectMerge(req, res, next),
);

// Keep existing merge route for owner's own PRs
router.patch('/:username/:reponame/:id/merge', authMiddleware, ownerMiddleware, (req: Request, res: Response, next: NextFunction) =>
  prController().merge(req, res, next),
);

// GET /vv/pr/:username/:reponame/:id/conflicts — get conflict details
router.get('/:username/:reponame/:id/conflicts', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  prController().getConflicts(req, res, next),
);
// POST /vv/pr/:username/:reponame/:id/resolve-conflicts — resolve conflicts and merge
router.post(
  '/:username/:reponame/:id/resolve-conflicts',
  authMiddleware,
  ownerMiddleware,
  (req: Request, res: Response, next: NextFunction) => prController().resolveConflicts(req as AuthRequest, res, next),
);

export default router;
