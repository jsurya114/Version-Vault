"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_config_1 = require("../../../shared/config/env.config");
const Logger_1 = require("../../../shared/logger/Logger");
const connectDatabase = async () => {
    try {
        await mongoose_1.default.connect(env_config_1.envConfig.MONGODB_URI);
        Logger_1.logger.info('MongoDB connected successfully');
    }
    catch (error) {
        Logger_1.logger.error('MongoDB connection failed', error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
