import { injectable, inject } from 'tsyringe';
import { IRecordActivityUseCase } from '../interfaces/activity/IRecordActivityUseCase';
import { IActivityRepository } from '../../../domain/interfaces/repositories/IActivityRepository';
import { IActivity } from '../../../domain/interfaces/IActivity';
import { TOKENS } from '../../../shared/constants/tokens';

@injectable()
export class RecordActivityUseCase implements IRecordActivityUseCase {
  constructor(@inject(TOKENS.IActivityRepository) private _activityRepo: IActivityRepository) {}

  async execute(activity: IActivity): Promise<void> {
    await this._activityRepo.save(activity);
  }
}
