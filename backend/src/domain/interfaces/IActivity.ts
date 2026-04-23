export type ActivityActionType = 'starred_repo' | 'forked_repo' | 'followed_user' | 'created_repo';

export interface IActivity {
  id?: string;
  actorId: string;
  actorUsername: string;
  actorAvatar?: string;
  isPrivate: boolean;
  actionType: ActivityActionType;
  targetId: string;
  targetName: string;
  createdAt?: Date;
}
