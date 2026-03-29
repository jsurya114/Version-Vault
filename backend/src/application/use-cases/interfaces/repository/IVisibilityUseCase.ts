import { RepositoryVisibility } from '../../../../domain/enums';
export interface IVisibilityUseCase {
  execute(username: string, reponame: string, visibility: RepositoryVisibility): Promise<void>;
}
