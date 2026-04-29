import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../shared/constants/tokens';
import { INotificationRepository } from '../../domain/interfaces/repositories/INotificationRepository';
import { ICollaboratorRepository } from '../../domain/interfaces/repositories/ICollaboratorRepository';
import { IRepoRepository } from '../../domain/interfaces/repositories/IRepoRepository';

import { ISocketEmitter } from '../../domain/interfaces/services/ISocketEmitter';
import { logger } from '../../shared/logger/Logger';
import { NotifyParams, NotifyRepoParams } from '../../application/dtos/repository/NotificationDTO';

@injectable()
export class NotificationService {
  constructor(
    @inject(TOKENS.INotificationRepository) private _notificationRepo: INotificationRepository,
    @inject(TOKENS.ICollaboratorRepository) private _collabRepo: ICollaboratorRepository,
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(TOKENS.ISocketEmitter) private _socketEmitter: ISocketEmitter,
  ) {}

  /**
   * Send notification to a SINGLE user.
   * Use for: follow, unfollow, fork, star
   */
  async notifyUser(params: NotifyParams): Promise<void> {
    try {
      //dont notify yourself
      if (params.actorId === params.recipientId) return;

      const notification = await this._notificationRepo.save({
        ...params,
        isRead: false,
      });
      this._socketEmitter.emitToUser(params.recipientId, 'notification', notification);
    } catch (error) {
      logger.error('failed to send notification:', error);
    }
  }

  /**
   * Send notification to ALL developers on a repo (owner + collaborators),
   * excluding the actor.
   * Use for: branch, PR, issue, file, commit, chat events
   */

  async notifyRepoDevelopers(params: NotifyRepoParams): Promise<void> {
    try {
      //get repo to find the owner
      const repo = await this._repoRepo.findById(params.repositoryId);
      if (!repo) return;
      //get all collaborators on this repo
      const collaborators = await this._collabRepo.findByRepository(params.repositoryId);

      //build reciept list:onwer+all collaborator IDs, minus the actor
      const recipientIds = new Set<string>();
      recipientIds.add(repo.ownerId); //add owner
      for (const collab of collaborators) {
        recipientIds.add(collab.collaboratorId);
      }
      recipientIds.delete(params.actorId); //exculde the actor

      // Create all notifications in a single batch insert
      const notificationPayloads = Array.from(recipientIds).map((recipientId) => ({
        recipientId,
        actorId: params.actorId,
        actorUsername: params.actorUsername,
        type: params.type,
        message: params.message,
        repositoryId: params.repositoryId,
        repositoryName: params.repositoryName || repo.name,
        metadata: params.metadata,
        isRead: false,
      }));

      if (notificationPayloads.length > 0) {
        const notifications = await this._notificationRepo.insertMany(notificationPayloads);
        
        // Emit socket events for each created notification
        notifications.forEach((notification) => {
          this._socketEmitter.emitToUser(notification.recipientId, 'notification', notification);
        });
      }
    } catch (error) {
      logger.error('Failed to send repo notifications:', error);
    }
  }
}
