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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuthService = void 0;
const tsyringe_1 = require("tsyringe");
const google_auth_library_1 = require("google-auth-library");
const env_config_1 = require("../../shared/config/env.config");
let GoogleAuthService = class GoogleAuthService {
    client;
    constructor() {
        this.client = new google_auth_library_1.OAuth2Client(env_config_1.envConfig.GOOGLE_CLIENT_ID, env_config_1.envConfig.GOOGLE_CLIENT_SECRET, env_config_1.envConfig.GOOGLE_CALLBACK_URL);
    }
    getAuthUrl() {
        return this.client.generateAuthUrl({
            access_type: 'offline',
            scope: ['profile', 'email'],
            prompt: 'consent',
        });
    }
    async getTokenFromCode(code) {
        const { tokens } = await this.client.getToken(code);
        return {
            accessToken: tokens.access_token || '',
            refreshToken: tokens.refresh_token || '',
            idToken: tokens.id_token || '',
        };
    }
    async getUserInfo(idToken) {
        const ticket = await this.client.verifyIdToken({
            idToken,
            audience: env_config_1.envConfig.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload)
            throw new Error('Invalid Google Token');
        return {
            googleId: payload.sub,
            email: payload.email || '',
            name: payload.name || '',
            avatar: payload.picture || '',
        };
    }
};
exports.GoogleAuthService = GoogleAuthService;
exports.GoogleAuthService = GoogleAuthService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], GoogleAuthService);
