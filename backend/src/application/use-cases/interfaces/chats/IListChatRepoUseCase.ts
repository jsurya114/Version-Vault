import { RepoResponseDTO } from '../../../../application/dtos/repository/RepoResponseDTO';

export interface IListChatRepoUseCase {
  execute(userId: string): Promise<RepoResponseDTO[]>;
}
