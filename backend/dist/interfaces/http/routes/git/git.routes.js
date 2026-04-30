"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GitHttpHandler_1 = require("../../handlers/GitHttpHandler");
const router = (0, express_1.Router)();
// GET /vv/git/:username/:reponame.git/info/refs
// used by git clone and git fetch
router.get('/:username/:reponame(*)/info/refs', (req, res) => (0, GitHttpHandler_1.handleGitRequest)(req, res));
// POST /vv/git/:username/:reponame.git/git-upload-pack
// used by git clone and git fetch (downloading objects)
router.post('/:username/:reponame(*)/git-upload-pack', (req, res) => (0, GitHttpHandler_1.handleGitRequest)(req, res));
// POST /vv/git/:username/:reponame.git/git-receive-pack
// used by git push (uploading objects)
router.post('/:username/:reponame(*)/git-receive-pack', (req, res) => (0, GitHttpHandler_1.handleGitRequest)(req, res));
exports.default = router;
