import { Router, Request, Response, NextFunction } from 'express';
import { handleGitRequest } from '../../handlers/GitHttpHandler';

const router = Router();

// GET /vv/git/:username/:reponame.git/info/refs
// used by git clone and git fetch

router.get('/:username/:reponame(*)/info/refs', (req: Request, res: Response) => handleGitRequest(req, res));

// POST /vv/git/:username/:reponame.git/git-upload-pack
// used by git clone and git fetch (downloading objects)

router.post('/:username/:reponame(*)/git-upload-pack', (req: Request, res: Response) => handleGitRequest(req, res));

// POST /vv/git/:username/:reponame.git/git-receive-pack
// used by git push (uploading objects)

router.post('/:username/:reponame(*)/git-receive-pack', (req: Request, res: Response) => handleGitRequest(req, res));

export default router;
