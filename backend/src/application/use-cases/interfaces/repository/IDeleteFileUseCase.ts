import { DeleteFileDTO } from '../../../../application/dtos/repository/DeleteFileDTO';

export interface IDeleteFileUseCase {
  execute(dto: DeleteFileDTO): Promise<void>;
}
