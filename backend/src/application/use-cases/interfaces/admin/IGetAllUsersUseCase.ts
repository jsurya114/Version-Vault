import { UserResponseDTO } from "src/application/dtos/admin/UserResponseDTO";
export interface IGetAllUsersUseCase{
    execute():Promise<UserResponseDTO[]>
}