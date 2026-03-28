import { CreateCommitDTO } from "src/application/dtos/repository/CreateCommitDTO";

export interface ICreateCommitUseCase {
  execute(username: string, reponame: string, data: CreateCommitDTO): Promise<void>;
}