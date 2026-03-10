import { Router } from 'express';
import { container } from 'tsyringe';
import { AdminUserController } from '../../controllers/admin/AdminUserController';

const router = Router();
const adminUserController = container.resolve(AdminUserController);

router.get('/users', (req, res, next) => adminUserController.getAllUsers(req, res, next));
router.get('/users/:id', (req, res, next) => adminUserController.getUserById(req, res, next));
router.patch('/users/:id/block', (req, res, next) => adminUserController.blockUser(req, res, next));
router.patch('/users/:id/unblock', (req, res, next) =>
  adminUserController.unBlockUser(req, res, next),
);
export default router;
