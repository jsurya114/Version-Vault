import { Router } from 'express';
import { container } from 'tsyringe';
import {
  AuthRequest,
  CollaboratorController,
} from '../../controllers/collaborator/CollaboratorController';
import { authMiddleware } from '../../middleware/AuthMiddleware';

const router = Router();
const collabController = container.resolve(CollaboratorController);

// Add a collaborator
router.post('/:username/:reponame', authMiddleware, (req, res, next) =>
  collabController.addCollaborator(req as AuthRequest, res, next),
);

// Get all collaborators for a repo
router.get('/:username/:reponame', authMiddleware, (req, res, next) =>
  collabController.getCollaborators(req as AuthRequest, res, next),
);

// Check if current user has access
router.get('/:username/:reponame/check', authMiddleware, (req, res, next) =>
  collabController.checkAccess(req as AuthRequest, res, next),
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
