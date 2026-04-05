import { injectable } from 'tsyringe';
import { IInvitation } from '../../../../domain/interfaces/IInvitation';
import { IInvitationRepository } from '../../../../domain/interfaces/repositories/IInvitationRepository';
import { InvitationModel } from '../models/InvitationModel';
import { MongoBaseRepository } from './MongoBaseRepository';
import { InvitationMapper } from '../../../../application/mappers/InvitationMapper';

@injectable()
export class MongoInvitationRepository
  extends MongoBaseRepository<IInvitation>
  implements IInvitationRepository
{
  constructor() {
    super(InvitationModel);
  }

  protected toEntity(doc: unknown): IInvitation {
    return InvitationMapper.toEntity(doc);
  }

  async findByToken(token: string): Promise<IInvitation | null> {
    const doc = await InvitationModel.findOne({ token });
    return doc ? this.toEntity(doc) : null;
  }

  async findPendingByEmail(email: string): Promise<IInvitation[]> {
    const doc = await InvitationModel.find({ inviteeEmail: email, status: 'pending' });
    return doc.map(this.toEntity.bind(this));
  }

  async findByRepository(repositoryId: string): Promise<IInvitation[]> {
    const docs = await InvitationModel.find({ repositoryId });
    return docs.map(this.toEntity.bind(this));
  }

  async findPendingByRepoAndEmail(
    repositoryId: string,
    email: string,
  ): Promise<IInvitation | null> {
    const doc = await InvitationModel.findOne({
      repositoryId,
      inviteeEmail: email,
      status: 'pending',
    });
    return doc ? this.toEntity(doc) : null;
  }

  async updateStatus(token: string, status: string): Promise<IInvitation | null> {
    const doc = await InvitationModel.findOneAndUpdate({ token }, { status }, { new: true });
    return doc ? this.toEntity(doc) : null;
  }
}
