import { Model } from 'mongoose';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';
import { IBaseRepository } from '../../../../domain/interfaces/repositories/IBaseRepository';
export abstract class MongoBaseRepository<T> implements IBaseRepository<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(protected readonly model: Model<any>) {}

  async findById(id: string): Promise<T | null> {
    const doc = await this.model.findById(id).lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async find(filter?: Partial<T>): Promise<T[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docs = await this.model.find((filter as any) ?? {}).lean();
    return docs.map((doc) => this.toEntity(doc));
  }

  async save(entity: T): Promise<T> {
    const doc = new this.model(entity);
    const saved = await doc.save();
    return this.toEntity(saved.toObject());
  }

  async insertMany(entities: Partial<T>[]): Promise<T[]> {
    const docs = await this.model.insertMany(entities);
    return docs.map((doc) => this.toEntity(doc.toObject()));
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const doc = await this.model.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }
  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return result !== null;
  }

  async findWithpagination(
    filter: Record<string, unknown>,
    query: PaginationQueryDTO,
  ): Promise<PaginatedResponseDTO<T>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = Number(page - 1) * limit;
    const sortField = query.sort || 'createdAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;

    // Stable sorting: secondary sort by createdAt if primary is different
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortOptions: any = { [sortField]: sortOrder };
    if (sortField !== 'createdAt') {
      sortOptions.createdAt = -1;
    }

    const [docs, total] = await Promise.all([
      this.model.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected abstract toEntity(doc: any): T;
}
