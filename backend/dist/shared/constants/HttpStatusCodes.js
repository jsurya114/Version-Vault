"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpStatusCodes = void 0;
exports.HttpStatusCodes = {
    // Success
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    // Client Errors
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    // Server Errors
    INTERNAL_SERVER_ERROR: 500,
};
