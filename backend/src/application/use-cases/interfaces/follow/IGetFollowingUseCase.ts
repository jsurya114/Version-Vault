import { IFollow } from '../../../../domain/interfaces/IFollow';

export interface IGetFollowingUseCase {
  execute(userId: string): Promise<IFollow[]>;
}
