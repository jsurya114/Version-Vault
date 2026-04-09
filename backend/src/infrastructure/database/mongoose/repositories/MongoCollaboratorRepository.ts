import { injectable } from 'tsyringe';
import { ICollaborator } from '../../../../domain/interfaces/ICollaborator';
import { ICollaboratorRepository } from '../../../../domain/interfaces/repositories/ICollaboratorRepository';
import { CollaboratorModel } from '../models/CollaboratorModel';
import { MongoBaseRepository } from './MongoBaseRepository';
import { CollaboratorMapper } from 'src/application/mappers/CollaboratorMapper';

@injectable()
export class MongoCollaboratorRepository
  extends MongoBaseRepository<ICollaborator>
  implements ICollaboratorRepository
{
  constructor() {
    super(CollaboratorModel);
  }

  protected toEntity(doc: unknown): ICollaborator {
    return CollaboratorMapper.toICollaborator(doc);
  }

  async findByRepoAndUser(
    repositoryId: string,
    collaboratorId: string,
  ): Promise<ICollaborator | null> {
    const doc = await CollaboratorModel.findOne({ repositoryId, collaboratorId });
    return doc ? this.toEntity(doc) : null;
  }

  async findByRepository(repositoryId: string): Promise<ICollaborator[]> {
    const docs = await CollaboratorModel.find({ repositoryId });
    return docs.map(this.toEntity.bind(this));
  }

  async findByUser(collaboratorId: string): Promise<ICollaborator[]> {
    const docs = await CollaboratorModel.find({ collaboratorId });
    return docs.map(this.toEntity.bind(this));
  }

  async deleteByRepoAndUser(repositoryId: string, collaboratorId: string): Promise<boolean> {
    const result = await CollaboratorModel.deleteOne({ repositoryId, collaboratorId });
    return result.deletedCount > 0;
  }

  async updateRole(
    repositoryId: string,
    collaboratorId: string,
    role: string,
  ): Promise<ICollaborator | null> {
    const doc = await CollaboratorModel.findOneAndUpdate(
      { repositoryId, collaboratorId },
      { role },
      { new: true },
    );
    return doc ? this.toEntity(doc) : null;
  }
  async findCollabedRepos(userId: string): Promise<ICollaborator[]> {
    const docs = await CollaboratorModel.find({
      $or:[
        {collaboratorId:userId},
        {ownerId:userId}
      ]
    })
    return docs.map(this.toEntity.bind(this))
  }
}
