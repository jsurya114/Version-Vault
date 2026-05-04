"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const IssueController_1 = require("../../controllers/issues/IssueController");
const AuthMiddleware_1 = require("../../middleware/AuthMiddleware");
const visibilityMiddleware_1 = require("../../middleware/visibilityMiddleware");
const WriteAccessMiddleware_1 = require("../../middleware/WriteAccessMiddleware");
const router = (0, express_1.Router)();
const issueController = () => tsyringe_1.container.resolve(IssueController_1.IssueController);
// GET /vv/issues/:username/:reponame — list issues
router.get('/:username/:reponame', visibilityMiddleware_1.visibilityMiddleware, (req, res, next) => issueController().list(req, res, next));
// GET /vv/issues/:username/:reponame/:id — get single issue
router.get('/:username/:reponame/:id', visibilityMiddleware_1.visibilityMiddleware, (req, res, next) => issueController().getOne(req, res, next));
// POST /vv/issues/:username/:reponame — create issue (auth required)
router.post('/:username/:reponame', AuthMiddleware_1.authMiddleware, WriteAccessMiddleware_1.writeAccessMiddleware, (req, res, next) => issueController().create(req, res, next));
// PATCH /vv/issues/:username/:reponame/:id/close — close issue (auth required)
router.patch('/:username/:reponame/:id/close', AuthMiddleware_1.authMiddleware, WriteAccessMiddleware_1.writeAccessMiddleware, (req, res, next) => issueController().close(req, res, next));
exports.default = router;
