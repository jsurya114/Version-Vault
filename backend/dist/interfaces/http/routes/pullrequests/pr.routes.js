"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const PRController_1 = require("../../controllers/pullrequest/PRController");
const AuthMiddleware_1 = require("../../middleware/AuthMiddleware");
const ownerMiddleware_1 = require("../../middleware/ownerMiddleware");
const visibilityMiddleware_1 = require("../../middleware/visibilityMiddleware");
const WriteAccessMiddleware_1 = require("../../middleware/WriteAccessMiddleware");
const router = (0, express_1.Router)();
const prController = () => tsyringe_1.container.resolve(PRController_1.PRController);
// GET /vv/pr/:username/:reponame — list PRs
router.get('/:username/:reponame', visibilityMiddleware_1.visibilityMiddleware, (req, res, next) => prController().listPr(req, res, next));
// GET /vv/pr/:username/:reponame/:id — get single PR
router.get('/:username/:reponame/:id', (req, res, next) => prController().getPr(req, res, next));
// POST /vv/pr/:username/:reponame — create PR (auth required)
router.post('/:username/:reponame', AuthMiddleware_1.authMiddleware, WriteAccessMiddleware_1.writeAccessMiddleware, (req, res, next) => prController().create(req, res, next));
// PATCH /vv/pr/:username/:reponame/:id/merge — merge PR (auth required)
router.patch('/:username/:reponame/:id/merge', AuthMiddleware_1.authMiddleware, ownerMiddleware_1.ownerMiddleware, (req, res, next) => prController().merge(req, res, next));
// PATCH /vv/pr/:username/:reponame/:id/close — close PR (auth required)
router.patch('/:username/:reponame/:id/close', AuthMiddleware_1.authMiddleware, WriteAccessMiddleware_1.writeAccessMiddleware, (req, res, next) => prController().close(req, res, next));
// Collaborator requests merge (sends approval request to owner)
router.patch('/:username/:reponame/:id/request-merge', AuthMiddleware_1.authMiddleware, WriteAccessMiddleware_1.writeAccessMiddleware, (req, res, next) => prController().requestMerge(req, res, next));
// Owner approves and merges
router.patch('/:username/:reponame/:id/approve-merge', AuthMiddleware_1.authMiddleware, ownerMiddleware_1.ownerMiddleware, (req, res, next) => prController().approveMerge(req, res, next));
// Owner rejects merge request
router.patch('/:username/:reponame/:id/reject-merge', AuthMiddleware_1.authMiddleware, ownerMiddleware_1.ownerMiddleware, (req, res, next) => prController().rejectMerge(req, res, next));
// Keep existing merge route for owner's own PRs
router.patch('/:username/:reponame/:id/merge', AuthMiddleware_1.authMiddleware, ownerMiddleware_1.ownerMiddleware, (req, res, next) => prController().merge(req, res, next));
// GET /vv/pr/:username/:reponame/:id/conflicts — get conflict details
router.get('/:username/:reponame/:id/conflicts', AuthMiddleware_1.authMiddleware, (req, res, next) => prController().getConflicts(req, res, next));
// POST /vv/pr/:username/:reponame/:id/resolve-conflicts — resolve conflicts and merge
router.post('/:username/:reponame/:id/resolve-conflicts', AuthMiddleware_1.authMiddleware, ownerMiddleware_1.ownerMiddleware, (req, res, next) => prController().resolveConflicts(req, res, next));
exports.default = router;
