import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from 'src/application/dtos/reusable/PaginationDTO';
import { IUser } from '../IUser';
import { IBaseRepository } from './IBaseRepository';

export interface IAdminRepository extends IBaseRepository<IUser> {
  getAllUsers(query: PaginationQueryDTO): Promise<PaginatedResponseDTO<IUser>>;
  blockUser(id: string): Promise<IUser | null>;
  unblockUser(id: string): Promise<IUser | null>;
}
