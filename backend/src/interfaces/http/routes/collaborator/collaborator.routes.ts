import { Router } from 'express';
import { container } from 'tsyringe';
import {
  AuthRequest,
  CollaboratorController,
} from '../../controllers/collaborator/CollaboratorController';
import { authMiddleware } from '../../middleware/AuthMiddleware';

const router = Router();
const collabController = container.resolve(CollaboratorController);


// Get all repos where logged-in user is a collaborator
router.get('/repos', authMiddleware, (req, res, next) =>
  collabController.getAllCollabsRepo(req as AuthRequest, res, next),
);
// Get pending invitations for the logged-in user
router.get('/invitations/pending', authMiddleware, (req, res, next) =>
  collabController.getPendingInvitations(req as AuthRequest, res, next),
);
// Get invitation details by token (public — no auth needed to view)
router.get('/invitation/:token', (req, res, next) =>
  collabController.getInvitationByToken(req, res, next),
);
// Accept invitation (auth required)
router.post('/invitation/:token/accept', authMiddleware, (req, res, next) =>
  collabController.acceptInvitation(req as AuthRequest, res, next),
);
// Decline invitation (auth required)
router.post('/invitation/:token/decline', authMiddleware, (req, res, next) =>
  collabController.declineInvitation(req as AuthRequest, res, next),
);
// ===== DYNAMIC ROUTES AFTER =====
// Send invitation (owner only)
router.post('/:username/:reponame/invite', authMiddleware, (req, res, next) =>
  collabController.sendInvitation(req as AuthRequest, res, next),
);
// Check if current user has access
router.get('/:username/:reponame/check', authMiddleware, (req, res, next) =>
  collabController.checkAccess(req as AuthRequest, res, next),
);
// Add a collaborator
router.post('/:username/:reponame', authMiddleware, (req, res, next) =>
  collabController.addCollaborator(req as AuthRequest, res, next),
);
// Get all collaborators for a repo
router.get('/:username/:reponame', authMiddleware, (req, res, next) =>
  collabController.getCollaborators(req as AuthRequest, res, next),
);
// Update collaborator role
router.patch('/:username/:reponame/:collaboratorUsername', authMiddleware, (req, res, next) =>
  collabController.updateRole(req as AuthRequest, res, next),
);
// Remove a collaborator
router.delete('/:username/:reponame/:collaboratorUsername', authMiddleware, (req, res, next) =>
  collabController.removeCollaborator(req as AuthRequest, res, next),
);
export default router;