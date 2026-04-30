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
exports.RepositoryModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const index_1 = require("../../../../domain/enums/index");
const RepositorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    visibility: {
        type: String,
        enum: Object.values(index_1.RepositoryVisibility),
        default: index_1.RepositoryVisibility.PUBLIC,
    },
    ownerId: { type: String, required: true },
    ownerUsername: { type: String, required: true },
    defaultBranch: { type: String, default: 'main' },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    size: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isFork: { type: Boolean, default: false },
    parentRepoId: { type: String, default: null },
    parentRepoOwnerUsername: { type: String, default: null },
    starredBy: { type: [String], default: [] },
}, { timestamps: true });
RepositorySchema.index({ ownerId: 1, name: 1 }, { unique: true });
exports.RepositoryModel = mongoose_1.default.model('Repository', RepositorySchema);
