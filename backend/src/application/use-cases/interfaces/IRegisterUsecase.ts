import { RegisterDTO } from "../../dtos/auth/RegisterDTO";

export interface IRegisterUseCase{
    execute(dto:RegisterDTO):Promise<{message:string}>
}

