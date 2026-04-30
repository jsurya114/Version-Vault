"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("./container");
const app_1 = __importDefault(require("./app"));
const http_1 = __importDefault(require("http"));
const env_config_1 = require("./shared/config/env.config");
const Logger_1 = require("./shared/logger/Logger");
const connection_1 = require("./infrastructure/database/mongoose/connection");
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("./shared/constants/tokens");
const CICDWorker_1 = require("./infrastructure/workers/CICDWorker");
const startSever = async () => {
    try {
        await (0, connection_1.connectDatabase)();
        const server = http_1.default.createServer(app_1.default);
        tsyringe_1.container.registerInstance(tokens_1.TOKENS.HttpServer, server);
        tsyringe_1.container.resolve(tokens_1.TOKENS.ISocketEmitter);
        // Start CI/CD background worker
        CICDWorker_1.cicdWorker.on('completed', (job) => {
            Logger_1.logger.info(`[CI/CD] Job ${job.id} completed`);
        });
        CICDWorker_1.cicdWorker.on('failed', (job, err) => {
            Logger_1.logger.error(`[CI/CD] Job ${job?.id} failed: ${err.message}`);
        });
        Logger_1.logger.info('[CI/CD] Worker started and listening for jobs');
        //starting the server
        server.listen(env_config_1.envConfig.PORT, () => {
            Logger_1.logger.info(`Server running on port ${env_config_1.envConfig.PORT} in ${env_config_1.envConfig.NODE_ENV} mode`);
        });
    }
    catch (error) {
        console.error('CRASH ERROR:', error);
        process.exit(1);
    }
};
startSever();
