import { injectable, inject } from 'tsyringe';
import { IUpdateProfileUseCase } from '../interfaces/user/IUpdateProfileUseCase';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IUser } from '../../../domain/interfaces/IUser';
import { TOKENS } from 'src/shared/constants/tokens';
import { UserProfileDTO } from 'src/application/dtos/user/userProfileDTO';

@injectable()
export class UpdateProfileUseCase implements IUpdateProfileUseCase {
  constructor(@inject(TOKENS.IUserRepository) private _userRepository: IUserRepository) {}

  async execute(userId: string, data: UserProfileDTO): Promise<IUser> {
    const user = await this._userRepository.findByUserId(userId);

    if (!user) throw new Error('User not found');
    if (data.username) user.username = data.username;
    if (data.bio) user.bio = data.bio;
    if (data.avatar) user.avatar = data.avatar;

    const updatedUser = await this._userRepository.update(userId, user);
    if (!updatedUser) {
      throw new Error('Could not update profile information');
    }

    return updatedUser;
  }
}
