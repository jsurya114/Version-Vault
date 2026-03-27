export interface ITokenPayload {
  id: string;
  userId: string;
  role: string;
  email: string;
}

export interface ITokenService {
  generateAccessToken(payload: ITokenPayload): string;
  generateRefreshToken(payload: ITokenPayload): string;
  verifyAccessToken(token: string): ITokenPayload;
  verifyRefreshToken(token: string): ITokenPayload;
}
