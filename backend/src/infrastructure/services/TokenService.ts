import { injectable } from "tsyringe";
import { ITokenService,ITokenPayload } from "src/domain/interfaces/services/ITokenService";
import jwt, { SignOptions } from "jsonwebtoken"
import { envConfig } from "src/shared/config/env.config";

@injectable()
export class TokenService implements ITokenService{

generateAccessToken(payload: ITokenPayload): string {
    return jwt.sign(payload,envConfig.JWT_ACCESS_SECRET,{
        expiresIn:envConfig.JWT_ACCESS_EXPIRES
    } as SignOptions)
}

generateRefreshToken(payload: ITokenPayload): string {
    return jwt.sign(payload,envConfig.JWT_REFRESH_SECRET,{
        expiresIn:envConfig.JWT_REFRESH_EXPIRES
    } as SignOptions)
}

verifyAccessToken(token: string): ITokenPayload {
    return jwt.verify(token,envConfig.JWT_ACCESS_SECRET) as ITokenPayload
}

verifyRefreshToken(token: string): ITokenPayload {
    return jwt.verify(token,envConfig.JWT_REFRESH_SECRET) as ITokenPayload
}

}