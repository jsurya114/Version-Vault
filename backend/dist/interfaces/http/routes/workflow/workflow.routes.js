"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const WorkflowController_1 = require("../../controllers/workflow/WorkflowController");
const AuthMiddleware_1 = require("../../middleware/AuthMiddleware");
const router = (0, express_1.Router)();
const controller = tsyringe_1.container.resolve(WorkflowController_1.WorkflowController);
// GET /vv/workflows/run/:runId — get a single workflow run with logs (must be before /:username/:reponame)
router.get('/run/:runId', AuthMiddleware_1.authMiddleware, (req, res, next) => controller.getRun(req, res, next));
// GET /vv/workflows/:username/:reponame/status — get latest CI/CD status for branch protection
router.get('/:username/:reponame/status', AuthMiddleware_1.authMiddleware, (req, res, next) => controller.getLatestStatus(req, res, next));
// GET /vv/workflows/:username/:reponame — list all workflow runs for a repo
router.get('/:username/:reponame', AuthMiddleware_1.authMiddleware, (req, res, next) => controller.listRuns(req, res, next));
exports.default = router;
