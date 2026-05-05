import 'reflect-metadata';
import express, { RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { corsOptions } from './shared/config/cors.config';
import { envConfig } from './shared/config/env.config';
import { errorMiddleware } from './interfaces/http/middleware/ErrorMiddleware';
import { globalLimiter } from './shared/config/rateLimiter';
import { logger } from './shared/logger/Logger';

//routes
import authRoutes from './interfaces/http/routes/user/auth.routes';
import adminRoutes from './interfaces/http/routes/admin/admin.routes';
import repoRoutes from './interfaces/http/routes/repository/repository.routes';
import gitRoutes from './interfaces/http/routes/git/git.routes';
import pullrequesRoutes from './interfaces/http/routes/pullrequests/pr.routes';
import issuesRoutese from './interfaces/http/routes/issues/issue.route';
import follwoRoutes from './interfaces/http/routes/follow/follow.routes';
import userRoutes from './interfaces/http/routes/user/user.routes';
import collaboratorRoutes from './interfaces/http/routes/collaborator/collaborator.routes';
import commentRoutes from './interfaces/http/routes/comments/comment.routes';
import chatRoutes from './interfaces/http/routes/chat/chat.routes';
import aiAgentRoutes from './interfaces/http/routes/ai-agent/aiAgent.routes';
import notificationRoutes from './interfaces/http/routes/notifications/notifications.routes';
import activityRoutes from './interfaces/http/routes/activity/activiy.routes';
import subscriptionRoutes from './interfaces/http/routes/subscription/subscription.routes';
import workflowRoutes from './interfaces/http/routes/workflow/workflow.routes';

const app = express();

app.set('trust proxy', 1);

//security middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(globalLimiter);

//request parsing and security
app.use(cookieParser(envConfig.COOKIE_SECRET as string) as RequestHandler);
app.use(express.urlencoded({ extended: true }));

//webhook gets raw body (must be mounted before express.json())
app.use('/vv/subscription', subscriptionRoutes);

//general request parsing
app.use(express.json());

//logger
app.use(
  morgan('dev', {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      },
    },
  }),
);

app.get('/running', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Version Vault API is running',
  });
});

//api routes
app.use('/vv/auth', authRoutes);
app.use('/vv/admin', adminRoutes);
app.use('/vv/repo', repoRoutes);
app.use('/vv/git', gitRoutes);
app.use('/vv/pr', pullrequesRoutes);
app.use('/vv/issues', issuesRoutese);
app.use('/vv/follow', follwoRoutes);
app.use('/vv/user', userRoutes);
app.use('/vv/collaborators', collaboratorRoutes);
app.use('/vv/comments', commentRoutes);
app.use('/vv/chats', chatRoutes);
app.use('/vv/ai-agent', aiAgentRoutes);
app.use('/vv/notifications', notificationRoutes);
app.use('/vv/activity', activityRoutes);
app.use('/vv/workflows', workflowRoutes);

//error hanlding middleware
app.use(errorMiddleware);

export default app;
