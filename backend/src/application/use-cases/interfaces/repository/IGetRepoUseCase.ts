import { RepoResponseDTO } from '../../../../application/dtos/repository/RepoResponseDTO';

export interface IGetRepoUseCase {
  execute(
    ownerUsername: string,
    name: string,
    authenticatedUserId?: string,
  ): Promise<RepoResponseDTO>;
}
