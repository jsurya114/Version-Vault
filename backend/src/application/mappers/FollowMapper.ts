import { FollowResponseDTO } from '../dtos/repository/FollowDTO';
import { IFollow } from '../../domain/interfaces/IFollow';

export class FollowMapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toIFollow(doc: any): IFollow {
    return {
      id: doc.id?.toString(),
      followerId: doc.followerId,
      followerUsername: doc.followingUsername,
      followingId: doc.followingId,
      followingUsername: doc.followingUsername,
      createdAt: doc.createdAt,
    };
  }

  static toDTO(follow: IFollow): FollowResponseDTO {
    return {
      id: follow.id as string,
      followerId: follow.followerId,
      followerUsername: follow.followerUsername,
      followingId: follow.followingId,
      followingUsername: follow.followingUsername,
    };
  }
}
