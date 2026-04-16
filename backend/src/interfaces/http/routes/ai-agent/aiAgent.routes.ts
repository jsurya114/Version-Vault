import { Router } from 'express';
import { container } from 'tsyringe';
import { AIAgentController } from '../../controllers/ai-agent/AIAgentController';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { AuthRequest } from '../../controllers/repository/RepositoryController';

const router = Router();
const aiAgentController = container.resolve(AIAgentController);

router.use(authMiddleware);
router.post('/chat', (req, res, next) => aiAgentController.chat(req as AuthRequest, res, next));

export default router;
