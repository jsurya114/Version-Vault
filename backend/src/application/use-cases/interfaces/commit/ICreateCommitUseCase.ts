import { CreateCommitDTO } from 'src/application/dtos/repository/CreateCommitDTO';
export interface ICreateCommitUseCase {
  execute(dto: CreateCommitDTO): Promise<void>;
}
