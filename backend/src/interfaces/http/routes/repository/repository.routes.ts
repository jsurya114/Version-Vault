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

export default router;
