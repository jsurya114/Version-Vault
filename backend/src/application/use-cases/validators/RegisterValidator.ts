import { injectable,inject } from "tsyringe";
import type { IUserRepository } from "src/domain/interfaces/repositories/IUserRepository";
import type { RegisterDTO } from "../../dtos/auth/RegisterDTO";
import { ConflictError } from "src/domain/errors/ConflictError";
import { TOKENS } from "src/shared/constants/tokens";


@injectable()
export class RegisterValidator{
    constructor(@inject(TOKENS.IUserRepository) private readonly userRepo:IUserRepository){}

    async validate(validateDto:RegisterDTO):Promise<void>{
        const existingEmail = await this.userRepo.findByEmail(validateDto.email)//find user by email

        if(existingEmail){
            throw new ConflictError("Email already in use")
        }
        const existingUserId = await this.userRepo.findByUserId(validateDto.userId)//find user by userid

        if(existingUserId){
            throw new  ConflictError("UserId already exists")
        }

        const existingUserName=await this.userRepo.findByUserName(validateDto.username)//find user by username
         if(existingUserName){
  throw new  ConflictError("Username already exists")
         }
    }
}