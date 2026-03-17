import { injectable, inject } from 'tsyringe';
import { IDeleteRepoUsecase } from '../interfaces/repository/IDeleteRepoUseCase';
import { IRepoRepository } from 'src/domain/interfaces/repositories/IRepoRepository';
import { TOKENS } from 'src/shared/constants/tokens';
import { NotFoundError } from 'src/domain/errors/NotFoundError';
import { id } from 'zod/v4/locales';
import { GitService } from 'src/infrastructure/services/GitService';

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
