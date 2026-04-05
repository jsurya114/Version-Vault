import { IInvitation } from '../../domain/interfaces/IInvitation';

export class InvitationMapper {
  static toEntity(doc: unknown): IInvitation {
    const d = doc as IInvitation & { _id?: { toString(): string } };
    return {
      id: d.id?.toString() || d._id?.toString() || '',
      token: d.token,
      repositoryId: d.repositoryId,
      repositoryName: d.repositoryName,
      ownerId: d.ownerId,
      ownerUsername: d.ownerUsername,
      inviteeEmail: d.inviteeEmail,
      inviteeUserId: d.inviteeUserId,
      inviteeUsername: d.inviteeUsername,
      role: d.role,
      status: d.status,
      expiresAt: d.expiresAt,
      createdAt: d.createdAt,
    };
  }
}
