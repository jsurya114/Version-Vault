import { IInvitation } from '../../domain/interfaces/IInvitation';

export class InvitationMapper {
  static toEntity(doc: any): IInvitation {
    return {
      id: doc.id?.toString() || doc._id?.toString(),
      token: doc.token,
      repositoryId: doc.repositoryId,
      repositoryName: doc.repositoryName,
      ownerId: doc.ownerId,
      ownerUsername: doc.ownerUsername,
      inviteeEmail: doc.inviteeEmail,
      inviteeUserId: doc.inviteeUserId,
      inviteeUsername: doc.inviteeUsername,
      role: doc.role,
      status: doc.status,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
    };
  }
}
