// backend/src/types/express.d.ts
import { ITokenPayload } from '../domain/interfaces/services/ITokenService';

declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
    }
  }
}

export {};
