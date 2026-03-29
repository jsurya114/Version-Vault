import { Router } from 'express';
import { container } from 'tsyringe';
import { AdminUserController } from '../../controllers/admin/AdminUserController';
import { AdminRepoController } from '../../controllers/admin/AdminRepoController';

const router = Router();
const adminUserController = container.resolve(AdminUserController);
const adminRepoController = container.resolve(AdminRepoController);

router.get('/users', (req, res, next) => adminUserController.getAllUsers(req, res, next));
router.get('/users/:id', (req, res, next) => adminUserController.getUserById(req, res, next));
router.patch('/users/:id/block', (req, res, next) => adminUserController.blockUser(req, res, next));
router.patch('/users/:id/unblock', (req, res, next) =>
  adminUserController.unBlockUser(req, res, next),
);

router.get('/repositories', (req, res, next) =>
  adminRepoController.getAllRepositories(req, res, next),
);
router.patch('/repositories/:id/block', (req, res, next) =>
  adminRepoController.blockRepository(req, res, next),
);
router.patch('/repositories/:id/unblock', (req, res, next) =>
  adminRepoController.unblockRepository(req, res, next),
);

export default router;
