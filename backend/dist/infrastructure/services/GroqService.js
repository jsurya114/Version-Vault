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
exports.GroqService = void 0;
const tsyringe_1 = require("tsyringe");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const env_config_1 = require("../../shared/config/env.config");
let GroqService = class GroqService {
    groq;
    constructor() {
        this.groq = new groq_sdk_1.default({ apiKey: env_config_1.envConfig.GROQ_API_KEY });
    }
    async chat(messages, jsonMode) {
        const response = await this.groq.chat.completions.create({
            messages: messages,
            model: 'llama-3.1-8b-instant',
            response_format: jsonMode ? { type: 'json_object' } : undefined,
        });
        return response.choices[0]?.message.content || '';
    }
};
exports.GroqService = GroqService;
exports.GroqService = GroqService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], GroqService);
