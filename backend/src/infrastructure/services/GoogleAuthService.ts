import { inject, injectable } from 'tsyringe';
import { IGoogleAuthService } from '../../domain/interfaces/services/IGoogleAuthService';
import { OAuth2Client } from 'google-auth-library';
import { envConfig } from '../../shared/config/env.config';

@injectable()
export class GoogleAuthService implements IGoogleAuthService {
  private client: OAuth2Client;
  constructor() {
    this.client = new OAuth2Client(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_CALLBACK_URL,
    );
  }
  getAuthUrl(): string {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
      prompt: 'consent',
    });
  }

  async getTokenFromCode(
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string; idToken: string }> {
    const { tokens } = await this.client.getToken(code);
    return {
      accessToken: tokens.access_token || '',
      refreshToken: tokens.refresh_token || '',
      idToken: tokens.id_token || '',
    };
  }

  async getUserInfo(
    idToken: string,
  ): Promise<{ googleId: string; email: string; name: string; avatar: string }> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: envConfig.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google Token');

    return {
      googleId: payload.sub,
      email: payload.email || '',
      name: payload.name || '',
      avatar: payload.picture || '',
    };
  }
}
