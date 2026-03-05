import type { IUser } from "../IUser";

export interface IUserRepository{
    findById(id:string):Promise<IUser|null>
    findByEmail(email:string):Promise<IUser|null>
    findByUserId(userId:string):Promise<IUser|null>
    findByUserName(username:string):Promise<IUser|null>
    save(user:IUser):Promise<IUser>
    update(id:string,data:Partial<IUser>):Promise<IUser|null>
    delete(id:string):Promise<void>
}