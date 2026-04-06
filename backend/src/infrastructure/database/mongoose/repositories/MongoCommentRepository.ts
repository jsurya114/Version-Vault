import { injectable } from 'tsyringe';

import { ICommentRepository } from '../../../../domain/interfaces/repositories/ICommentRepository';
import { IComment } from '../../../../domain/interfaces/IComment';
import { CommentModel } from '../models/CommentModel';
import { CommentMapper } from '../../../../application/mappers/CommentMapper';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';
import { MongoBaseRepository } from './MongoBaseRepository';
import mongoose from 'mongoose';

@injectable()
export class MongoCommentRepository
  extends MongoBaseRepository<IComment>
  implements ICommentRepository
{
  constructor() {
    super(CommentModel);
  }

  protected toEntity(doc: unknown): IComment {
    return CommentMapper.toEntity(doc);
  }

  async findByTargetId(
    targetId: string,
    targetType: 'issue' | 'pr',
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<IComment>> {
    const filter: Record<string, unknown> = {
      targetId: new mongoose.Types.ObjectId(targetId),
      targetType,
    };

    return this.findWithpagination(filter, query);
  }

  async deleteManyByTargetId(targetId: string, targetType: 'issue' | 'pr'): Promise<void> {
    await CommentModel.deleteMany({ targetId, targetType }).exec();
  }
}
