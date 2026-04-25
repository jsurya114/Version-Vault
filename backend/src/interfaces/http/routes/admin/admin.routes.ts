import { Router, Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { AdminUserController } from '../../controllers/admin/AdminUserController';
import { AdminRepoController } from '../../controllers/admin/AdminRepoController';

const router = Router();
const adminUserController = container.resolve(AdminUserController);
const adminRepoController = container.resolve(AdminRepoController);

router.get('/users', (req: Request, res: Response, next: NextFunction) => adminUserController.getAllUsers(req, res, next));
router.get('/users/:id', (req: Request, res: Response, next: NextFunction) => adminUserController.getUserById(req, res, next));
router.patch('/users/:id/block', (req: Request, res: Response, next: NextFunction) => adminUserController.blockUser(req, res, next));
router.patch('/users/:id/unblock', (req: Request, res: Response, next: NextFunction) =>
  adminUserController.unBlockUser(req, res, next),
);

router.get('/repositories', (req: Request, res: Response, next: NextFunction) =>
  adminRepoController.getAllRepositories(req, res, next),
);
router.get('/repositories/:id', (req: Request, res: Response, next: NextFunction) =>
  adminRepoController.getRepoById(req, res, next),
);
router.patch('/repositories/:id/block', (req: Request, res: Response, next: NextFunction) =>
  adminRepoController.blockRepository(req, res, next),
);
router.patch('/repositories/:id/unblock', (req: Request, res: Response, next: NextFunction) =>
  adminRepoController.unblockRepository(req, res, next),
);

export default router;
