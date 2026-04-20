import { INotification } from '../../../../domain/interfaces/INotification';

export interface IMarkNotificationReadUseCase {
  execute(notificationId: string): Promise<INotification | null>;
}
