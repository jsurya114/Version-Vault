import { IActivity } from '../../../../domain/interfaces/IActivity';
export interface IRecordActivityUseCase {
  execute(activity: IActivity): Promise<void>;
}
