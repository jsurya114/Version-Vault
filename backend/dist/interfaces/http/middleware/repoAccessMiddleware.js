"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repoAccessMiddleware = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
const UnauthorizedError_1 = require("../../../domain/errors/UnauthorizedError");
const repoAccessMiddleware = async (req, res, next) => {
    try {
        const { username, reponame } = req.params;
        const user = req.user;
        const repoRepo = tsyringe_1.container.resolve(tokens_1.TOKENS.IRepoRepository);
        const collabRepo = tsyringe_1.container.resolve(tokens_1.TOKENS.ICollaboratorRepository);
        // 1. Check if Repo exists and get it
        const repo = await repoRepo.findByOwnerAndName(username, reponame);
        if (!repo) {
            throw new NotFoundError_1.NotFoundError('Repo not found');
        }
        // 2. Global Block Check
        if (repo.isBlocked) {
            throw new NotFoundError_1.NotFoundError('Repository is currently blocked');
        }
        // 3. Visibility Check logic
        if (repo.visibility === 'private') {
            if (!user) {
                throw new UnauthorizedError_1.UnauthorizedError('Authentication required for private repo comments');
            }
            const isOwner = repo.ownerId.toString() === user.id;
            if (!isOwner) {
                // If not owner, check if the user is a collaborator
                const collab = await collabRepo.findByRepoAndUser(repo.id, user.id);
                if (!collab) {
                    throw new UnauthorizedError_1.UnauthorizedError('You do not have permission to access comments on this private repository');
                }
            }
        }
        // 4. Attach the loaded repo to the request so the controllers don't have to query the DB again!
        res.locals.repo = repo;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.repoAccessMiddleware = repoAccessMiddleware;
