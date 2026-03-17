import { Request, Response } from 'express';
import { spawn } from 'child_process';
import * as path from 'path';
import { envConfig } from 'src/shared/config/env.config';

export const handleGitRequest = (req: Request, res: Response): void => {
  const { username, reponame } = req.params;
  const repoBasePath = path.resolve(envConfig.GIT_REPO_PATH || './repos');
  //find the bare repo is on disk
  const repoPath = path.join(repoBasePath, username, `${reponame}.git`);

  //set environment variables git-http backend needs
  const env = {
    ...process.env,
    GIT_PROJECT_ROOT: repoBasePath,
    GIT_HTTP_EXPORT_ALL: '1',
    REMOTE_USER: username,
    PATH_INFO: req.path,
    QUERY_STRING: req.url.includes('?') ? req.url.split('?')[1] : '',
    REQUEST_METHOD: req.method,
    CONTENT_TYPE: req.headers['content-type'] || '',
    GIT_DIR: repoPath,
  };

  const git = spawn('git', ['http-backend'], { env });
  req.pipe(git.stdin);
  let headersParsed = false;
  let buffer = Buffer.alloc(0);
  git.stdout.on('data', (data: Buffer) => {
    if (headersParsed) {
      res.write(data);
      return;
    }

    buffer = Buffer.concat([buffer, data]);

    const headerEnd = buffer.indexOf('\r\n\r\n');

    if (headerEnd !== -1) {
      headersParsed = true;
      const headerSection = buffer.slice(0, headerEnd).toString();
      const body = buffer.slice(headerEnd + 4);

      //parse and set headers

      headerSection.split('\r\n').forEach((l) => {
        const [key, ...rest] = l.split(': ');
        const value = rest.join(': ');

        if (key && value) {
          if (key.toLowerCase() === 'status') {
            res.status(parseInt(value.split(' ')[0]));
          } else {
            res.setHeader(key, value);
          }
        }
      });
      if (body.length > 0) res.write(body);
    }
  });
  git.stdout.on('end', () => res.end());
  git.stderr.on('data', (data: Buffer) => {
    console.error('git-http-backend error:', data.toString());
  });

  git.on('error', (err) => {
    console.error('Failed to spawn git-http-backend:', err);
    res.status(500).json({ success: false, message: 'Git server error' });
  });
};
