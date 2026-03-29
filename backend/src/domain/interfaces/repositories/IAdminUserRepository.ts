import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../application/dtos/reusable/PaginationDTO';

import { IUser } from '../IUser';
import { IBaseRepository } from './IBaseRepository';

export interface IAdminUserRepository extends IBaseRepository<IUser> {
  getAllUsers(query: PaginationQueryDTO): Promise<PaginatedResponseDTO<IUser>>;
  blockUser(id: string): Promise<IUser | null>;
  unblockUser(id: string): Promise<IUser | null>;
}
