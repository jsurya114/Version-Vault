"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const UserController_1 = require("../../controllers/user/UserController");
const AuthMiddleware_1 = require("../../middleware/AuthMiddleware");
const UploadMiddleware_1 = require("../../middleware/UploadMiddleware");
const router = (0, express_1.Router)();
const userController = tsyringe_1.container.resolve(UserController_1.UserController);
/**
 * User Routes
 * Base path: /vv/user
 */
// Public profile access (Anyone can view any username)
router.get('/:username', (req, res, next) => userController.getPublicProfile(req, res, next));
// Private profile editing (Only authenticated users can edit their own profile)
router.patch('/profile', AuthMiddleware_1.authMiddleware, UploadMiddleware_1.upload.single('avatar'), // Multer looks for a field named 'avatar'
(req, res, next) => userController.updateProfile(req, res, next));
exports.default = router;
