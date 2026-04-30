"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowMapper = void 0;
class FollowMapper {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static toIFollow(doc) {
        return {
            id: doc.id?.toString(),
            followerId: doc.followerId,
            followerUsername: doc.followerUsername,
            followingId: doc.followingId,
            followingUsername: doc.followingUsername,
            createdAt: doc.createdAt,
        };
    }
    static toDTO(follow) {
        return {
            id: follow.id,
            followerId: follow.followerId,
            followerUsername: follow.followerUsername,
            followingId: follow.followingId,
            followingUsername: follow.followingUsername,
        };
    }
}
exports.FollowMapper = FollowMapper;
