import { Router } from 'express';
import { container } from 'tsyringe';
import { WorkflowController } from '../../controllers/workflow/WorkflowController';
import { authMiddleware } from '../../middleware/AuthMiddleware';

const router = Router();
const controller = container.resolve(WorkflowController);

// GET /vv/workflows/run/:runId — get a single workflow run with logs (must be before /:username/:reponame)
router.get('/run/:runId', authMiddleware, (req, res, next) => controller.getRun(req, res, next));

// GET /vv/workflows/:username/:reponame/status — get latest CI/CD status for branch protection
router.get('/:username/:reponame/status', authMiddleware, (req, res, next) =>
  controller.getLatestStatus(req, res, next),
);

// GET /vv/workflows/:username/:reponame — list all workflow runs for a repo
router.get('/:username/:reponame', authMiddleware, (req, res, next) =>
  controller.listRuns(req, res, next),
);

export default router;
