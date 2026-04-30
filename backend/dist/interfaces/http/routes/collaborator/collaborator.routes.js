"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const CollaboratorController_1 = require("../../controllers/collaborator/CollaboratorController");
const AuthMiddleware_1 = require("../../middleware/AuthMiddleware");
const router = (0, express_1.Router)();
const collabController = () => tsyringe_1.container.resolve(CollaboratorController_1.CollaboratorController);
// Get all repos where logged-in user is a collaborator
router.get('/repos', AuthMiddleware_1.authMiddleware, (req, res, next) => collabController().getAllCollabsRepo(req, res, next));
// Get pending invitations for the logged-in user
router.get('/invitations/pending', AuthMiddleware_1.authMiddleware, (req, res, next) => collabController().getPendingInvitations(req, res, next));
// Get invitation details by token (public — no auth needed to view)
router.get('/invitation/:token', (req, res, next) => collabController().getInvitationByToken(req, res, next));
// Accept invitation (auth required)
router.post('/invitation/:token/accept', AuthMiddleware_1.authMiddleware, (req, res, next) => collabController().acceptInvitation(req, res, next));
// Decline invitation (auth required)
router.post('/invitation/:token/decline', AuthMiddleware_1.authMiddleware, (req, res, next) => collabController().declineInvitation(req, res, next));
// ===== DYNAMIC ROUTES AFTER =====
// Send invitation (owner only)
router.post('/:username/:reponame/invite', AuthMiddleware_1.authMiddleware, (req, res, next) => collabController().sendInvitation(req, res, next));
// Check if current user has access
router.get('/:username/:reponame/check', AuthMiddleware_1.authMiddleware, (req, res, next) => collabController().checkAccess(req, res, next));
// Add a collaborator
router.post('/:username/:reponame', AuthMiddleware_1.authMiddleware, (req, res, next) => collabController().addCollaborator(req, res, next));
// Get all collaborators for a repo
router.get('/:username/:reponame', AuthMiddleware_1.authMiddleware, (req, res, next) => collabController().getCollaborators(req, res, next));
// Update collaborator role
router.patch('/:username/:reponame/:collaboratorUsername', AuthMiddleware_1.authMiddleware, (req, res, next) => collabController().updateRole(req, res, next));
// Remove a collaborator
router.delete('/:username/:reponame/:collaboratorUsername', AuthMiddleware_1.authMiddleware, (req, res, next) => collabController().removeCollaborator(req, res, next));
exports.default = router;
