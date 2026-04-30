"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAccessMiddleware = void 0;
const tsyringe_1 = require("tsyringe");
const UnauthorizedError_1 = require("../../../domain/errors/UnauthorizedError");
const tokens_1 = require("../../../shared/constants/tokens");
const writeAccessMiddleware = async (req, res, next) => {
    try {
        const user = req.user;
        const { username, reponame } = req.params;
        //onwer always has acess
        if (user?.userId === username) {
            return next();
        }
        //check if user is a collaborator with write or admin role
        const repoRepo = tsyringe_1.container.resolve(tokens_1.TOKENS.IRepoRepository);
        const collabRepo = tsyringe_1.container.resolve(tokens_1.TOKENS.ICollaboratorRepository);
        const repo = await repoRepo.findByOwnerAndName(username, reponame);
        if (!repo) {
            return next(new UnauthorizedError_1.UnauthorizedError('Repository not found'));
        }
        const collab = await collabRepo.findByRepoAndUser(repo.id, user?.id);
        if (collab && (collab.role === 'write' || collab.role === 'admin')) {
            return next();
        }
        return next(new UnauthorizedError_1.UnauthorizedError('Access denied: You need write access to perform this action.'));
    }
    catch (error) {
        next(error);
    }
};
exports.writeAccessMiddleware = writeAccessMiddleware;
