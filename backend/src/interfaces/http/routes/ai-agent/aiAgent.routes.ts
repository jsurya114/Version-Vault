import { Router, Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { AIAgentController } from '../../controllers/ai-agent/AIAgentController';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { AuthRequest } from '../../controllers/repository/RepositoryController';

const router = Router();
const aiAgentController = (): AIAgentController => container.resolve(AIAgentController);

router.use(authMiddleware);
router.post('/chat', (req: Request, res: Response, next: NextFunction) => aiAgentController().chat(req as AuthRequest, res, next));

export default router;
