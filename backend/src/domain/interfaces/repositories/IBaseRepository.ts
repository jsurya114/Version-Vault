export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  find(filter?: Partial<T>): Promise<T[]>;
  save(entity: T): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}
