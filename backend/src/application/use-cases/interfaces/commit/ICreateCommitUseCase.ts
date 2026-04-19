import { CreateCommitDTO } from '../../../../application/dtos/repository/CreateCommitDTO';

export interface ICreateCommitUseCase {
  execute(
    username: string,
    reponame: string,
    data: CreateCommitDTO,
    actorId: string,
    actorUsername: string,
  ): Promise<void>;
}
