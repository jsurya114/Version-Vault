import { Router, Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import {
  AuthRequest,
  CollaboratorController,
} from '../../controllers/collaborator/CollaboratorController';
import { authMiddleware } from '../../middleware/AuthMiddleware';

const router = Router();
const collabController = (): CollaboratorController => container.resolve(CollaboratorController);

// Get all repos where logged-in user is a collaborator
router.get('/repos', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  collabController().getAllCollabsRepo(req as AuthRequest, res, next),
);
// Get pending invitations for the logged-in user
router.get('/invitations/pending', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  collabController().getPendingInvitations(req as AuthRequest, res, next),
);
// Get invitation details by token (public — no auth needed to view)
router.get('/invitation/:token', (req: Request, res: Response, next: NextFunction) =>
  collabController().getInvitationByToken(req, res, next),
);
// Accept invitation (auth required)
router.post('/invitation/:token/accept', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  collabController().acceptInvitation(req as AuthRequest, res, next),
);
// Decline invitation (auth required)
router.post('/invitation/:token/decline', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  collabController().declineInvitation(req as AuthRequest, res, next),
);
// ===== DYNAMIC ROUTES AFTER =====
// Send invitation (owner only)
router.post('/:username/:reponame/invite', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  collabController().sendInvitation(req as AuthRequest, res, next),
);
// Check if current user has access
router.get('/:username/:reponame/check', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  collabController().checkAccess(req as AuthRequest, res, next),
);
// Add a collaborator
router.post('/:username/:reponame', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  collabController().addCollaborator(req as AuthRequest, res, next),
);
// Get all collaborators for a repo
router.get('/:username/:reponame', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  collabController().getCollaborators(req as AuthRequest, res, next),
);
// Update collaborator role
router.patch('/:username/:reponame/:collaboratorUsername', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  collabController().updateRole(req as AuthRequest, res, next),
);
// Remove a collaborator
router.delete('/:username/:reponame/:collaboratorUsername', authMiddleware, (req: Request, res: Response, next: NextFunction) =>
  collabController().removeCollaborator(req as AuthRequest, res, next),
);
export default router;
