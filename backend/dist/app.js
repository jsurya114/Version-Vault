"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_config_1 = require("./shared/config/cors.config");
const env_config_1 = require("./shared/config/env.config");
const ErrorMiddleware_1 = require("./interfaces/http/middleware/ErrorMiddleware");
const rateLimiter_1 = require("./shared/config/rateLimiter");
const Logger_1 = require("./shared/logger/Logger");
//routes
const auth_routes_1 = __importDefault(require("./interfaces/http/routes/user/auth.routes"));
const admin_routes_1 = __importDefault(require("./interfaces/http/routes/admin/admin.routes"));
const repository_routes_1 = __importDefault(require("./interfaces/http/routes/repository/repository.routes"));
const git_routes_1 = __importDefault(require("./interfaces/http/routes/git/git.routes"));
const pr_routes_1 = __importDefault(require("./interfaces/http/routes/pullrequests/pr.routes"));
const issue_route_1 = __importDefault(require("./interfaces/http/routes/issues/issue.route"));
const follow_routes_1 = __importDefault(require("./interfaces/http/routes/follow/follow.routes"));
const user_routes_1 = __importDefault(require("./interfaces/http/routes/user/user.routes"));
const collaborator_routes_1 = __importDefault(require("./interfaces/http/routes/collaborator/collaborator.routes"));
const comment_routes_1 = __importDefault(require("./interfaces/http/routes/comments/comment.routes"));
const chat_routes_1 = __importDefault(require("./interfaces/http/routes/chat/chat.routes"));
const aiAgent_routes_1 = __importDefault(require("./interfaces/http/routes/ai-agent/aiAgent.routes"));
const notifications_routes_1 = __importDefault(require("./interfaces/http/routes/notifications/notifications.routes"));
const activiy_routes_1 = __importDefault(require("./interfaces/http/routes/activity/activiy.routes"));
const subscription_routes_1 = __importDefault(require("./interfaces/http/routes/subscription/subscription.routes"));
const workflow_routes_1 = __importDefault(require("./interfaces/http/routes/workflow/workflow.routes"));
const app = (0, express_1.default)();
//security middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)(cors_config_1.corsOptions));
app.use(rateLimiter_1.globalLimiter);
//request parsing and security
app.use((0, cookie_parser_1.default)(env_config_1.envConfig.COOKIE_SECRET));
app.use(express_1.default.urlencoded({ extended: true }));
//webhook gets raw body (must be mounted before express.json())
app.use('/vv/subscription', subscription_routes_1.default);
//general request parsing
app.use(express_1.default.json());
//logger
app.use((0, morgan_1.default)('dev', {
    stream: {
        write: (message) => {
            Logger_1.logger.info(message.trim());
        },
    },
}));
app.get('/running', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Version Vault API is running',
    });
});
//api routes
app.use('/vv/auth', auth_routes_1.default);
app.use('/vv/admin', admin_routes_1.default);
app.use('/vv/repo', repository_routes_1.default);
app.use('/vv/git', git_routes_1.default);
app.use('/vv/pr', pr_routes_1.default);
app.use('/vv/issues', issue_route_1.default);
app.use('/vv/follow', follow_routes_1.default);
app.use('/vv/user', user_routes_1.default);
app.use('/vv/collaborators', collaborator_routes_1.default);
app.use('/vv/comments', comment_routes_1.default);
app.use('/vv/chats', chat_routes_1.default);
app.use('/vv/ai-agent', aiAgent_routes_1.default);
app.use('/vv/notifications', notifications_routes_1.default);
app.use('/vv/activity', activiy_routes_1.default);
app.use('/vv/workflows', workflow_routes_1.default);
//error hanlding middleware
app.use(ErrorMiddleware_1.errorMiddleware);
exports.default = app;
