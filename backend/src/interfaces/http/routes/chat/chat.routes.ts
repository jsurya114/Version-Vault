import { Router } from 'express';
import { container } from 'tsyringe';
import { ChatController } from '../../controllers/chat/ChatController';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { AuthRequest } from '../../controllers/repository/RepositoryController';

const router = Router();

const chatController = container.resolve(ChatController);

router.get('/:username/:reponame/history', authMiddleware, (req, res, next) =>
  chatController.getHistory(req, res, next),
);
router.post('/:username/:reponame', authMiddleware, (req, res, next) =>
  chatController.sendMessage(req as AuthRequest, res, next),
);

router.get('/message/:messageId', authMiddleware, (req, res, next) =>
  chatController.getMessage(req as AuthRequest, res, next),
);

router.delete('/:messageId', authMiddleware, (req, res, next) =>
  chatController.deleteMessage(req as AuthRequest, res, next),
);

router.get('/conversations', authMiddleware, (req, res, next) =>
  chatController.getChatRepo(req as AuthRequest, res, next),
);

export default router;
