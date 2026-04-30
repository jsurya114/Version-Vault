"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRValidator = void 0;
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
class PRValidator {
    static async findOrFail(prRepository, id) {
        const pr = await prRepository.findById(id);
        if (!pr)
            throw new NotFoundError_1.NotFoundError('Pull request not found');
        return pr;
    }
    static assertOpen(pr, action) {
        if (pr.status !== 'open') {
            throw new Error(`Only open pull requests can be ${action}`);
        }
    }
}
exports.PRValidator = PRValidator;
