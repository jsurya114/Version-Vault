import { IFollow } from 'src/domain/interfaces/IFollow';

export interface IGetFollowersUseCase {
  execute(userId: string): Promise<IFollow[]>;
}
