import { Model, Document } from 'mongoose';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';
import { IBaseRepository } from '../../../../domain/interfaces/repositories/IBaseRepository';
export abstract class MongoBaseRepository<T> implements IBaseRepository<T> {
  constructor(protected readonly model: Model<any>) {}

  async findById(id: string): Promise<T | null> {
    const doc = await this.model.findById(id).lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async find(filter?: Partial<T>): Promise<T[]> {
    const docs = await this.model.find((filter as any) ?? {}).lean();
    return docs.map((doc) => this.toEntity(doc));
  }

  async save(entity: T): Promise<T> {
    const doc = new this.model(entity);
    const saved = await doc.save();
    return this.toEntity(saved.toObject());
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const doc = await this.model.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }
  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return result !== null;
  }

  async findWithpagination(
    filter: Record<string, any>,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<T>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = Number(page - 1) * limit;
    const sortField = query.sort || 'createdAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;
    const [docs, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);

    return {
      data: docs.map((doc) => this.toEntity(doc)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  protected abstract toEntity(doc: any): T;
}
