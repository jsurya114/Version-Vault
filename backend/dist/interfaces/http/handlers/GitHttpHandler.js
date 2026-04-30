"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGitRequest = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const env_config_1 = require("../../../shared/config/env.config");
const handleGitRequest = (req, res) => {
    const { username, reponame } = req.params;
    const cleanReponame = reponame.endsWith('.git') ? reponame.slice(0, -4) : reponame;
    const repoBasePath = path.resolve(env_config_1.envConfig.GIT_REPO_PATH || './repos');
    //find the bare repo is on disk
    const repoPath = path.join(repoBasePath, username, `${cleanReponame}.git`);
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
    const git = (0, child_process_1.spawn)('git', ['http-backend'], { env });
    req.pipe(git.stdin);
    let headersParsed = false;
    let buffer = Buffer.alloc(0);
    git.stdout.on('data', (data) => {
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
                    }
                    else {
                        res.setHeader(key, value);
                    }
                }
            });
            if (body.length > 0)
                res.write(body);
        }
    });
    git.stdout.on('end', () => res.end());
    git.stderr.on('data', (data) => {
        console.error('git-http-backend error:', data.toString());
    });
    git.on('error', (err) => {
        console.error('Failed to spawn git-http-backend:', err);
        res.status(500).json({ success: false, message: 'Git server error' });
    });
};
exports.handleGitRequest = handleGitRequest;
