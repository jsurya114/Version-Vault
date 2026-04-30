"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueValidator = void 0;
class IssueValidator {
    static async findOrFail(_issueRepo, id) {
        const issue = await _issueRepo.findById(id);
        if (!issue)
            throw new Error('Issue not found');
        return issue;
    }
    static assertOpen(issue) {
        if (issue.status !== 'open') {
            throw new Error('Only open issues can be closed');
        }
    }
}
exports.IssueValidator = IssueValidator;
