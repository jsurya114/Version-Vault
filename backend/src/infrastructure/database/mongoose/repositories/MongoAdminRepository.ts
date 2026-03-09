import { IUser } from "src/domain/interfaces/IUser";
import { UserModel } from "../models/UserModel";
import { UserMapper } from "src/application/mappers/UserMapper";
import { injectable } from "tsyringe";
import { IAdminRepository } from "src/domain/interfaces/repositories/IAdminRepository";

@injectable()
export class MongoAdminRepository implements IAdminRepository{
    async getAllUsers(): Promise<IUser[]> {
        const users =await UserModel.find().lean()
        return users.map((p)=>UserMapper.toIUser(p))
    }
    async getUserById(id: string): Promise<IUser | null> {
        const user = await UserModel.findById(id).lean()
        if(!user) return null
        return UserMapper.toIUser(user)

    }
}