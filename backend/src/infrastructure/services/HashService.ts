import { injectable } from "tsyringe";
import bcrypt from "bcryptjs"
import { IHashService } from "src/domain/interfaces/services/IHashService";

@injectable()
export class HashService implements IHashService{
    private readonly saltGen = 10

    async hash(text: string): Promise<string> {
        return  bcrypt.hash(text,this.saltGen)
    }
    async compare(text: string, hash: string): Promise<boolean> {
        return bcrypt.compare(text,hash)
    }
}