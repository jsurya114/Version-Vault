import { IUser } from '../../../../domain/interfaces/IUser';
import { UserProfileDTO } from '../../../dtos/user/userProfileDTO';

export interface IUpdateProfileUseCase {
  execute(userId: string, data: UserProfileDTO): Promise<IUser>;
}
