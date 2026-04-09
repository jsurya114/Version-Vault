import { Router } from 'express';
import { container } from 'tsyringe';
import { RepositoryController } from '../../controllers/repository/RepositoryController';
import { UploadFileController } from '../../controllers/repository/UploadFileController';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { ownerMiddleware } from '../../middleware/ownerMiddleware';
import { BranchController } from '../../controllers/branch/BranchController';
import { AuthRequest } from '../../controllers/repository/RepositoryController';
import { CommitController } from '../../controllers/commit/CommitController';
import { visibilityMiddleware } from '../../middleware/visibilityMiddleware';
import { writeAccessMiddleware } from '../../middleware/WriteAccessMiddleware';
import { uploadRepoFiles } from 'src/infrastructure/config/multer.config';

const router = Router();
const repoController = container.resolve(RepositoryController);
const branchController = container.resolve(BranchController);
const commitController = container.resolve(CommitController);
const fileUploadController = container.resolve(UploadFileController);

router.post('/', authMiddleware, (req, res, next) =>
  repoController.createRepository(req as AuthRequest, res, next),
);
router.get('/', authMiddleware, (req, res, next) =>
  repoController.listRepository(req as AuthRequest, res, next),
);
router.get('/:username/:reponame', visibilityMiddleware, (req, res, next) =>
  repoController.getRepository(req, res, next),
);
router.delete('/:username/:reponame', authMiddleware, ownerMiddleware, (req, res, next) =>
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
router.post(
  '/:username/:reponame/branches',
  authMiddleware,
  writeAccessMiddleware,
  (req, res, next) => branchController.createBranch(req, res, next),
);
router.delete(
  '/:username/:reponame/branches/:branchName',
  authMiddleware,
  writeAccessMiddleware,
  (req, res, next) => branchController.deleteBranch(req, res, next),
);

router.post(
  '/:username/:reponame/commit',
  authMiddleware,
  writeAccessMiddleware,
  (req, res, next) => commitController.createCommit(req as AuthRequest, res, next),
);

router.get(
  '/:username/:reponame/compare/:base/:head',
  authMiddleware,
  writeAccessMiddleware,
  (req, res, next) => commitController.compareCommit(req, res, next),
);

router.patch('/:username/:reponame/visibility', authMiddleware, ownerMiddleware, (req, res, next) =>
  repoController.updateVisibility(req as AuthRequest, res, next),
);

router.post('/:username/:reponame/fork', authMiddleware, (req, res, next) =>
  repoController.forkRepository(req as AuthRequest, res, next),
);

router.post('/:username/:reponame/star', authMiddleware, (req, res, next) =>
  repoController.toggleStar(req as AuthRequest, res, next),
);
router.get('/:username/:reponame/star/users', (req, res, next) =>
  repoController.getStarredUsers(req, res, next),
);

router.post(
  '/upload',
  authMiddleware,
  uploadRepoFiles.array('files'), // "files" is the form-data key
  (req, res, next) => fileUploadController.fileUpload(req as AuthRequest, res, next),
);
export default router;
