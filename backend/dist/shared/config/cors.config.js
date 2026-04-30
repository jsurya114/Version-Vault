"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const env_config_1 = require("./env.config");
exports.corsOptions = {
    // Allow only our frontend URL
    origin: env_config_1.envConfig.CLIENT_URL,
    // Allow cookies to be sent with requests
    credentials: true,
    // Allowed HTTP methods
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // Allowed headers
    allowedHeaders: ['Content-Type', 'Authorization'],
};
