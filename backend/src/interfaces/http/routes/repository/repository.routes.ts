import { Router } from 'express';
import { container } from 'tsyringe';
import { RepositoryController } from '../../controllers/repository/RepositoryController';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { BranchController } from '../../controllers/branch/BranchController';
import { AuthRequest } from '../../controllers/repository/RepositoryController';

const router = Router();
const repoController = container.resolve(RepositoryController);
const branchController = container.resolve(BranchController);

router.post('/', authMiddleware, (req, res, next) =>
  repoController.createRepository(req as AuthRequest, res, next),
);
router.get('/', authMiddleware, (req, res, next) =>
  repoController.listRepository(req as AuthRequest, res, next),
);
router.get('/:username/:reponame', (req, res, next) =>
  repoController.getRepository(req, res, next),
);
router.delete('/:username/:reponame', authMiddleware, (req, res, next) =>
  repoController.deleteRepository(req as AuthRequest, res, next),
);
// GET /vv/repo/:username/:reponame/files — get files
router.get('/:username/:reponame/files', (req, res, next) =>
  repoController.getFiles(req, res, next),
);

// GET /vv/repo/:username/:reponame/content — get file content
router.get('/:username/:reponame/content', (req, res, next) =>
  repoController.getFileContent(req, res, next),
);

// GET /vv/repo/:username/:reponame/commits — get commits
router.get('/:username/:reponame/commits', (req, res, next) =>
  repoController.getCommit(req, res, next),
);
router.get('/:username/:reponame/branches', (req, res, next) =>
  branchController.getBranches(req, res, next),
);
router.post('/:username/:reponame/branches', authMiddleware, (req, res, next) =>
  branchController.createBranch(req, res, next),
);
router.delete('/:username/:reponame/branches/:branchName', authMiddleware, (req, res, next) =>
  branchController.deleteBranch(req, res, next),
);

export default router;
