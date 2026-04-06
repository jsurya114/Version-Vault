import { ToggleStarDTO } from '../../../../application/dtos/repository/RepoResponseDTO';

export interface IToggleStarUseCase {
  execute(dto: ToggleStarDTO): Promise<{ isStarred: boolean; starsCount: number }>;
}
