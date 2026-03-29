import { injectable, inject } from 'tsyringe';
import { IRepoRepository } from '../../../domain/interfaces/repositories/IRepoRepository';
import { TOKENS } from '../../../shared/constants/tokens';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { RepositoryVisibility } from '../../../domain/enums';
import { IVisibilityUseCase } from '../interfaces/repository/IVisibilityUseCase';

@injectable()
export class VisibilityUseCase implements IVisibilityUseCase {
  constructor(@inject(TOKENS.IRepoRepository) private _repoRepository: IRepoRepository) {}

  async execute(
    username: string,
    reponame: string,
    visibility: RepositoryVisibility,
  ): Promise<void> {
    const repo = await this._repoRepository.findByOwnerAndName(username, reponame);
    if (!repo) throw new NotFoundError('Repository not found');

    await this._repoRepository.update(repo.id!, { visibility });
  }
}
