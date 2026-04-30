"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const CommentController_1 = require("../../controllers/comment/CommentController");
// Middlewares
const AuthMiddleware_1 = require("../../middleware/AuthMiddleware");
const visibilityMiddleware_1 = require("../../middleware/visibilityMiddleware");
const repoAccessMiddleware_1 = require("../../middleware/repoAccessMiddleware");
const router = (0, express_1.Router)();
const commentController = () => tsyringe_1.container.resolve(CommentController_1.CommentController);
// CREATE Comment: User MUST be logged in (authMiddleware), then validated for repo permission (repoAccessMiddleware)
router.post('/:username/:reponame/:targetType/:targetId', AuthMiddleware_1.authMiddleware, repoAccessMiddleware_1.repoAccessMiddleware, (req, res, next) => commentController().createComment(req, res, next));
// VIEW Comments: Let anyone try to view (visibilityMiddleware), but repoAccessMiddleware will block them if it's a private repo and they lack permissions.
router.get('/:username/:reponame/:targetType/:targetId', visibilityMiddleware_1.visibilityMiddleware, repoAccessMiddleware_1.repoAccessMiddleware, (req, res, next) => commentController().listComment(req, res, next));
// DELETE Comment: Strict auth check
router.delete('/:commentId', AuthMiddleware_1.authMiddleware, (req, res, next) => commentController().delete(req, res, next));
exports.default = router;
