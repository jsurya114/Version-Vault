import { Router, Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { ChatController } from '../../controllers/chat/ChatController';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { AuthRequest } from '../../controllers/repository/RepositoryController';

const router = Router();

const chatController = (): ChatController => container.resolve(ChatController);

router.get('/:username/:reponame/history', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  chatController().getHistory(req, res, next),
);
router.post('/:username/:reponame', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  chatController().sendMessage(req as AuthRequest, res, next),
);

router.get('/message/:messageId', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  chatController().getMessage(req as AuthRequest, res, next),
);

router.delete('/:messageId', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  chatController().deleteMessage(req as AuthRequest, res, next),
);

router.get('/conversations', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  chatController().getChatRepo(req as AuthRequest, res, next),
);

export default router;
