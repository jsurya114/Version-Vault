import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../../shared/constants/tokens';
import { IDownloadZipUseCase } from '../../../../application/use-cases/interfaces/repository/IDownloadZipUseCase';

import { logger } from 'src/shared/logger/Logger';

@injectable()
export class DownloadZipController {
  constructor(
    @inject(TOKENS.IDownloadZipUseCase) private _downloadZipUseCase: IDownloadZipUseCase,
  ) {}

  async downloadZip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const branch = (req.query.branch as string) || 'main';
      const zipStream = await this._downloadZipUseCase.excute(username, reponame, branch);

      //set headers for file download
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${reponame}-${branch}.zip"`);

      //pipe the zip stream directly to the http reponse
      zipStream.pipe(res);
      zipStream.on('error', (err) => {
        logger.error('Error streaming ZIP:', err);
        if (!res.headersSent) {
          next(err);
        } else {
          res.end();
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
