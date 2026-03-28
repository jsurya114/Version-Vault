import { IUser } from '../../../../domain/interfaces/IUser';

export interface IGetProfileUseCase {
  execute(userId: string): Promise<IUser>;
}
