import { UserResponseDTO } from "src/application/dtos/admin/UserResponseDTO";


export interface IGetMeUseCase{
     execute(userId:string):Promise<UserResponseDTO>
}