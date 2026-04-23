import { IActivity } from '../../domain/interfaces/IActivity';

export class ActivityMapper {
  static toEntity(doc: unknown): IActivity {
    const d = doc as IActivity & { _id?: { toString(): string } };
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
