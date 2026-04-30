"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const RepositoryController_1 = require("../../controllers/repository/RepositoryController");
const UploadFileController_1 = require("../../controllers/repository/UploadFileController");
const AuthMiddleware_1 = require("../../middleware/AuthMiddleware");
const ownerMiddleware_1 = require("../../middleware/ownerMiddleware");
const BranchController_1 = require("../../controllers/branch/BranchController");
const CommitController_1 = require("../../controllers/commit/CommitController");
const visibilityMiddleware_1 = require("../../middleware/visibilityMiddleware");
const WriteAccessMiddleware_1 = require("../../middleware/WriteAccessMiddleware");
const multer_config_1 = require("../../../../infrastructure/config/multer.config");
const DownloadZipController_1 = require("../../controllers/repository/DownloadZipController");
const router = (0, express_1.Router)();
const repoController = () => tsyringe_1.container.resolve(RepositoryController_1.RepositoryController);
const branchController = () => tsyringe_1.container.resolve(BranchController_1.BranchController);
const commitController = () => tsyringe_1.container.resolve(CommitController_1.CommitController);
const fileUploadController = () => tsyringe_1.container.resolve(UploadFileController_1.UploadFileController);
const downloadZipController = () => tsyringe_1.container.resolve(DownloadZipController_1.DownloadZipController);
router.post('/', AuthMiddleware_1.authMiddleware, (req, res, next) => repoController().createRepository(req, res, next));
router.get('/', AuthMiddleware_1.authMiddleware, (req, res, next) => repoController().listRepository(req, res, next));
router.get('/:username/:reponame', visibilityMiddleware_1.visibilityMiddleware, (req, res, next) => repoController().getRepository(req, res, next));
router.delete('/:username/:reponame', AuthMiddleware_1.authMiddleware, ownerMiddleware_1.ownerMiddleware, (req, res, next) => repoController().deleteRepository(req, res, next));
// GET /vv/repo/:username/:reponame/files — get files
router.get('/:username/:reponame/files', (req, res, next) => repoController().getFiles(req, res, next));
// GET /vv/repo/:username/:reponame/content — get file content
router.get('/:username/:reponame/content', (req, res, next) => repoController().getFileContent(req, res, next));
// GET /vv/repo/:username/:reponame/commits — get commits
router.get('/:username/:reponame/commits', (req, res, next) => repoController().getCommit(req, res, next));
router.get('/:username/:reponame/branches', (req, res, next) => branchController().getBranches(req, res, next));
router.post('/:username/:reponame/branches', AuthMiddleware_1.authMiddleware, WriteAccessMiddleware_1.writeAccessMiddleware, (req, res, next) => branchController().createBranch(req, res, next));
router.delete('/:username/:reponame/branches/:branchName', AuthMiddleware_1.authMiddleware, WriteAccessMiddleware_1.writeAccessMiddleware, (req, res, next) => branchController().deleteBranch(req, res, next));
router.post('/:username/:reponame/commit', AuthMiddleware_1.authMiddleware, WriteAccessMiddleware_1.writeAccessMiddleware, (req, res, next) => commitController().createCommit(req, res, next));
router.get('/:username/:reponame/compare/:base/:head', AuthMiddleware_1.authMiddleware, WriteAccessMiddleware_1.writeAccessMiddleware, (req, res, next) => commitController().compareCommit(req, res, next));
router.patch('/:username/:reponame/visibility', AuthMiddleware_1.authMiddleware, ownerMiddleware_1.ownerMiddleware, (req, res, next) => repoController().updateVisibility(req, res, next));
router.post('/:username/:reponame/fork', AuthMiddleware_1.authMiddleware, (req, res, next) => repoController().forkRepository(req, res, next));
router.post('/:username/:reponame/star', AuthMiddleware_1.authMiddleware, (req, res, next) => repoController().toggleStar(req, res, next));
router.get('/:username/:reponame/star/users', (req, res, next) => repoController().getStarredUsers(req, res, next));
router.post('/upload', AuthMiddleware_1.authMiddleware, multer_config_1.uploadRepoFiles.array('files'), // "files" is the form-data key
(req, res, next) => fileUploadController().fileUpload(req, res, next));
router.get('/:username/:reponame/active-branches', AuthMiddleware_1.authMiddleware, (req, res, next) => repoController().getActiveBranches(req, res, next));
router.delete('/:username/:reponame/file', AuthMiddleware_1.authMiddleware, (req, res, next) => repoController().deleteFile(req, res, next));
//download zipfile
router.get('/:username/:reponame/download/zip', AuthMiddleware_1.authMiddleware, visibilityMiddleware_1.visibilityMiddleware, (req, res, next) => downloadZipController().downloadZip(req, res, next));
//rename branch
router.put('/:username/:reponame/branches/:branchName', AuthMiddleware_1.authMiddleware, WriteAccessMiddleware_1.writeAccessMiddleware, (req, res, next) => branchController().renameBranch(req, res, next));
exports.default = router;
