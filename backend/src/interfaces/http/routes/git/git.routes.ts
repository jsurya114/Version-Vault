import { Router, Response, Request, NextFunction } from 'express';
import { handleGitRequest } from '../../handlers/GitHttpHandler';
import { gitAuthMiddleware } from '../../middleware/GitAuthMiddleware';

const router = Router();

// GET /vv/git/:username/:reponame.git/info/refs
// used by git clone and git fetch

router.get('/:username/:reponame(*)/info/refs', (req, res) => handleGitRequest(req, res));

// POST /vv/git/:username/:reponame.git/git-upload-pack
// used by git clone and git fetch (downloading objects)

router.post('/:username/:reponame(*)/git-upload-pack', (req, res) => handleGitRequest(req, res));

// POST /vv/git/:username/:reponame.git/git-receive-pack
// used by git push (uploading objects)

router.post('/:username/:reponame(*)/git-receive-pack', (req, res) => handleGitRequest(req, res));

export default router;
