import { UserResponseDTO } from 'src/application/dtos/admin/UserResponseDTO';
import {
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from 'src/application/dtos/reusable/PaginationDTO';
export interface IGetAllUsersUseCase {
  execute(query: PaginationQueryDTO): Promise<PaginatedResponseDTO<UserResponseDTO>>;
}
