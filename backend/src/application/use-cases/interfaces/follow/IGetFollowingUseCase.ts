import { IFollow } from 'src/domain/interfaces/IFollow';

export interface IGetFollowingUseCase {
  execute(userId: string): Promise<IFollow[]>;
}
