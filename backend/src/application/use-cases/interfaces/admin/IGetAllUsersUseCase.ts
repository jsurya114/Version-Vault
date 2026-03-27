import { UserResponseDTO } from '../../../../application/dtos/admin/UserResponseDTO';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '../../../../application/dtos/reusable/PaginationDTO';
export interface IGetAllUsersUseCase {
  execute(query: PaginationQueryDTO): Promise<PaginatedResponseDTO<UserResponseDTO>>;
}
