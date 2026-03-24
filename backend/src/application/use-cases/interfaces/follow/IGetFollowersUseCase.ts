import { IFollow } from '../../../../domain/interfaces/IFollow';

export interface IGetFollowersUseCase {
  execute(userId: string): Promise<IFollow[]>;
}
