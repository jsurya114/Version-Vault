import { injectable, inject } from 'tsyringe';
import { IDeleteRepoUsecase } from '../interfaces/repository/IDeleteRepoUseCase';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';

import { GitService } from '../../../infrastructure/services/GitService';

@injectable()
export class DeleteRepoUseCase implements IDeleteRepoUsecase {
  constructor(
    @inject(TOKENS.IRepoRepository) private repoRepository: IRepoRepository,
    @inject(GitService) private gitService: GitService,
  ) {}

  async execute(ownerUsername: string, name: string): Promise<void> {
    const repo = await this.repoRepository.findByOwnerAndName(ownerUsername, name);
    if (!repo) throw new NotFoundError('Repository not found');
    //delte from mongodb
    await this.repoRepository.delete(repo.id as string);

    //dlete repo from disk
    await this.gitService.deleteBareRepo(ownerUsername, name);
  }
}
