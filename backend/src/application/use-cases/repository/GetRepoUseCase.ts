import { injectable, inject } from 'tsyringe';
import { IGetRepoUseCase } from '../interfaces/repository/IGetRepoUseCase';
import { IRepoRepository } from 'src/domain/interfaces/repositories/IRepoRepository';
import { RepoResponseDTO } from 'src/application/dtos/repository/RepoResponseDTO';
import { TOKENS } from 'src/shared/constants/tokens';
import { NotFoundError } from 'src/domain/errors/NotFoundError';
import { RepositoryMapper } from 'src/application/mappers/RepositoryMapper';

@injectable()
export class GetRepoUseCase implements IGetRepoUseCase {
  constructor(@inject(TOKENS.IRepoRepository) private repoRepository: IRepoRepository) {}

  async execute(ownerUsername: string, name: string): Promise<RepoResponseDTO> {
    const repo = await this.repoRepository.findByOwnerAndName(ownerUsername, name);
    if (!repo) throw new NotFoundError('Repository not found');

    return RepositoryMapper.toDTO(repo);
  }
}
