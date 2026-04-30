"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerRunnerService = void 0;
const tsyringe_1 = require("tsyringe");
const dockerode_1 = __importDefault(require("dockerode"));
const WorkflowRunModel_1 = require("../../database/mongoose/models/WorkflowRunModel");
let DockerRunnerService = class DockerRunnerService {
    docker;
    constructor() {
        this.docker = new dockerode_1.default({ socketPath: '/var/run/docker.sock' });
    }
    async executeJob(job, runId, repoCloneUrl, commitHash) {
        let container = null;
        try {
            // 1. Determine image (e.g., ubuntu-latest -> ubuntu:latest)
            const image = job.runsOn.replace('-latest', ':latest');
            // 2. Pull the image if not exists
            await new Promise((resolve, reject) => {
                this.docker.pull(image, (err, stream) => {
                    if (err)
                        return reject(err);
                    this.docker.modem.followProgress(stream, onFinished);
                    function onFinished(err, output) {
                        if (err)
                            return reject(err);
                        resolve(output);
                    }
                });
            });
            // 3. Create the container
            container = await this.docker.createContainer({
                Image: image,
                Cmd: ['/bin/sh', '-c', 'sleep 3600'], // Keep container alive to run execs
                Tty: true,
            });
            await container.start();
            await this.appendLog(runId, `[System] Container started with image: ${image}\n`);
            // 4. Clone the repository inside the container
            const cloneSuccess = await this.runCommandInContainer(container, runId, `git clone ${repoCloneUrl} workspace`);
            if (!cloneSuccess)
                throw new Error("Failed to clone repository. Make sure git is installed in the runner image.");
            const checkoutSuccess = await this.runCommandInContainer(container, runId, `cd workspace && git checkout ${commitHash}`);
            if (!checkoutSuccess)
                throw new Error(`Failed to checkout commit ${commitHash}`);
            // 5. Execute user defined steps
            for (const step of job.steps) {
                await this.appendLog(runId, `[Step] Running: ${step.name}\n`);
                if (step.run) {
                    const success = await this.runCommandInContainer(container, runId, `cd workspace && ${step.run}`);
                    if (!success) {
                        throw new Error(`Step '${step.name}' failed.`);
                    }
                }
            }
            await this.appendLog(runId, `[System] Job completed successfully.\n`);
            await this.waitForLogs(runId);
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            await this.appendLog(runId, `[System Error] ${errorMessage}\n`);
            await this.waitForLogs(runId);
            return false;
        }
        finally {
            // Clean up the container
            if (container) {
                await container.stop();
                await container.remove();
            }
        }
    }
    async waitForLogs(runId) {
        if (this.flushTimers.has(runId)) {
            clearTimeout(this.flushTimers.get(runId));
            this.flushTimers.delete(runId);
            const chunkToSave = this.logBuffers.get(runId) || '';
            this.logBuffers.delete(runId);
            if (chunkToSave) {
                const queue = this.logQueues.get(runId) || Promise.resolve();
                const nextQueue = queue.then(async () => {
                    try {
                        const run = await WorkflowRunModel_1.WorkflowRunModel.findById(runId);
                        if (run) {
                            run.logs = (run.logs || '') + chunkToSave;
                            await run.save();
                        }
                    }
                    catch (err) { }
                });
                this.logQueues.set(runId, nextQueue);
            }
        }
        await (this.logQueues.get(runId) || Promise.resolve());
    }
    async runCommandInContainer(container, runId, cmd) {
        const exec = await container.exec({
            Cmd: ['/bin/sh', '-c', cmd],
            AttachStdout: true,
            AttachStderr: true,
            Tty: true, // Prevent Docker multiplexing stream headers
        });
        const stream = (await exec.start({ Detach: false, Tty: true }));
        // Stream logs to database (or Redis/Socket.IO)
        stream.on('data', async (chunk) => {
            await this.appendLog(runId, chunk.toString('utf8'));
        });
        return new Promise((resolve) => {
            stream.on('end', async () => {
                const inspect = await exec.inspect();
                resolve(inspect.ExitCode === 0);
            });
        });
    }
    logQueues = new Map();
    logBuffers = new Map();
    flushTimers = new Map();
    async appendLog(runId, logChunk) {
        const current = this.logBuffers.get(runId) || '';
        this.logBuffers.set(runId, current + logChunk);
        if (!this.flushTimers.has(runId)) {
            const timer = setTimeout(async () => {
                this.flushTimers.delete(runId);
                const chunkToSave = this.logBuffers.get(runId) || '';
                this.logBuffers.delete(runId);
                if (!chunkToSave)
                    return;
                const queue = this.logQueues.get(runId) || Promise.resolve();
                const nextQueue = queue.then(async () => {
                    try {
                        const run = await WorkflowRunModel_1.WorkflowRunModel.findById(runId);
                        if (run) {
                            run.logs = (run.logs || '') + chunkToSave;
                            await run.save();
                        }
                    }
                    catch (err) {
                        console.error('Failed to append log:', err);
                    }
                });
                this.logQueues.set(runId, nextQueue);
            }, 200);
            this.flushTimers.set(runId, timer);
        }
    }
};
exports.DockerRunnerService = DockerRunnerService;
exports.DockerRunnerService = DockerRunnerService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], DockerRunnerService);
