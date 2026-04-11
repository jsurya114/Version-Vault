import { UploadFilesDTO } from '../../../../application/dtos/repository/UploadFileDTO';

export interface IUploadFileUseCase {
  execute(dto: UploadFilesDTO): Promise<void>;
}
