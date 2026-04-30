"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchMapper = void 0;
class BranchMapper {
    static toEntity(doc) {
        const d = doc;
        return {
            repositoryId: d.repositoryId,
            branchName: d.branchName,
            createdBy: d.createdBy,
            createdAt: d.createdAt,
        };
    }
}
exports.BranchMapper = BranchMapper;
