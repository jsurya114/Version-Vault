"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityMapper = void 0;
class ActivityMapper {
    static toEntity(doc) {
        const d = doc;
        return {
            actorId: d.actorId,
            actorUsername: d.actorUsername,
            actorAvatar: d.actorAvatar,
            isPrivate: d.isPrivate,
            actionType: d.actionType,
            targetId: d.targetId,
            targetName: d.targetName,
            createdAt: d.createdAt,
        };
    }
}
exports.ActivityMapper = ActivityMapper;
