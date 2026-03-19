import { Router } from 'express';
import { container } from 'tsyringe';
import { RepositoryController } from '../../controllers/repository/RepositoryController';
import { authMiddleware } from '../../middleware/AuthMiddleware';

const router = Router();
const repoController = container.resolve(RepositoryController);

router.post('/', authMiddleware, (req, res, next) =>
  repoController.createRepository(req, res, next),
);
router.get('/', authMiddleware, (req, res, next) => repoController.listRepository(req, res, next));
router.get('/:username/:reponame', (req, res, next) =>
  repoController.getRepository(req, res, next),
);
router.delete('/:username/:reponame', authMiddleware, (req, res, next) =>
  repoController.deleteRepository(req, res, next),
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

export default router;
