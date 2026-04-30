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
exports.WinstonLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const tsyringe_1 = require("tsyringe");
const { combine, timestamp, printf, colorize, errors } = winston_1.default.format;
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});
let WinstonLogger = class WinstonLogger {
    _logger;
    constructor() {
        this._logger = winston_1.default.createLogger({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
            transports: [
                new winston_1.default.transports.Console(),
                new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }),
                new winston_1.default.transports.File({ filename: 'logs/combined.log' }),
            ],
        });
    }
    info(message, meta) {
        this._logger.info(message, meta);
    }
    error(message, error, meta) {
        if (message instanceof Error) {
            this._logger.error(message.message, {
                stack: message.stack,
                ...(error || {}),
                ...meta,
            });
            return;
        }
        this._logger.error(message, { error, ...meta });
    }
    warn(message, meta) {
        this._logger.warn(message, meta);
    }
    debug(message, meta) {
        this._logger.debug(message, meta);
    }
};
exports.WinstonLogger = WinstonLogger;
exports.WinstonLogger = WinstonLogger = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], WinstonLogger);
