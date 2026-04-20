import { NextFunction, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IUploadFileUseCase } from '../../../../application/use-cases/interfaces/repository/IUploadFileUseCase';
import { TOKENS } from '../../../../shared/constants/tokens';
import { AuthRequest } from './RepositoryController';

import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';

@injectable()
export class UploadFileController {
  constructor(@inject(TOKENS.IUploadFileUseCase) private _uploadFileUseCase: IUploadFileUseCase) {}

  async fileUpload(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { repositoryName, branch, commitMessage, repoOwnerUsername } = req.body;
      const ownerId = req.user!.id;
      const actorUsername = req.user!.userId;
      const ownerEmail = req.user!.email;

      const targetOwnerUsername = repoOwnerUsername || actorUsername;

      const files = req.files as Express.Multer.File[];

      const parsedFiles = files.map((file) => {
        let frontendRelativePath = file.originalname;
        // Multer does not parse relative folder paths easily by default.
        // We will pass an array of `filePaths` in the body that matches the original names
        // to reconstruct the folder structure uploaded from the frontend.

        if (req.body.filePaths) {
          const pathArray = Array.isArray(req.body.filePaths)
            ? req.body.filePaths
            : [req.body.filePaths];

          // Attempt to match the exact original bucket

          const match = pathArray.find((p: string) => p.endsWith(file.originalname));

          if (match) frontendRelativePath = match;
        }
        return {
          filePath: frontendRelativePath,
          tempDiskPath: file.path,
        };
      });
      await this._uploadFileUseCase.execute({
        ownerId,
        ownerUsername: targetOwnerUsername,
        ownerEmail,
        repoName: repositoryName,
        branch,
        commitMessage,
        files: parsedFiles,
      });
      res
        .status(HttpStatusCodes.OK)
        .json({ success: true, message: 'Files uploaded successfully' });
    } catch (error) {
      next(error);
    }
  }
}
