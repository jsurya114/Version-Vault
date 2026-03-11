import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from 'src/application/dtos/reusable/PaginationDTO';
import { IUser } from '../IUser';

export interface IAdminRepository {
  getAllUsers(query: PaginationQueryDTO): Promise<PaginatedResponseDTO<IUser>>;
  getUserById(id: string): Promise<IUser | null>;
  blockUser(id: string): Promise<IUser | null>;
  unblockUser(id: string): Promise<IUser | null>;
}
