import { injectable } from 'tsyringe';
import { IOtpService } from '../../domain/interfaces/services/IOtpService';
import { redisClient } from '../Redis/RedisClient';
import { envConfig } from '../../shared/config/env.config';

@injectable()
export class OtpService implements IOtpService {
  private readonly OTP_PREFIX = 10;

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 90000).toString();
  }

  async saveOtp(email: string, otp: string): Promise<void> {
    const key = `${this.OTP_PREFIX}${email}`;
    const expirySeconds = envConfig.OTP_EXPIRES_MINUTES * 60;

    await redisClient.setex(key, expirySeconds, otp);
  }
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const key = `${this.OTP_PREFIX}${email}`;
    const storedOtp = await redisClient.get(key);
    return storedOtp === otp;
  }

  async deleteOtp(email: string): Promise<void> {
    const key = `${this.OTP_PREFIX}${email}`;
    await redisClient.del(key);
  }
}
