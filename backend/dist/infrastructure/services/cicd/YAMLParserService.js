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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.YAMLParserService = void 0;
const tsyringe_1 = require("tsyringe");
const yaml = __importStar(require("yaml"));
let YAMLParserService = class YAMLParserService {
    parse(yamlString) {
        try {
            const parsed = yaml.parse(yamlString);
            // Basic validation to ensure the user didn't write garbage YAML
            if (!parsed.jobs || !parsed.name) {
                throw new Error("Invalid workflow file: Missing 'name' or 'jobs'");
            }
            // Map YAML keys (runs-on) to TypeScript interface keys (runsOn)
            const jobs = {};
            for (const [jobName, jobDef] of Object.entries(parsed.jobs)) {
                const raw = jobDef;
                jobs[jobName] = {
                    name: raw.name || jobName,
                    runsOn: raw['runs-on'] || raw.runsOn || 'ubuntu:latest',
                    steps: raw.steps || [],
                };
            }
            return {
                name: parsed.name,
                on: Array.isArray(parsed.on) ? parsed.on : [parsed.on],
                jobs,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to parse workflow YAML: ${errorMessage}`);
        }
    }
};
exports.YAMLParserService = YAMLParserService;
exports.YAMLParserService = YAMLParserService = __decorate([
    (0, tsyringe_1.injectable)()
], YAMLParserService);
