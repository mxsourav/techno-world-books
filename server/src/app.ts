import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { env } from './config/env.js';
import { requestIdMiddleware } from './middlewares/requestId.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import routes from './routes/index.js';

const app = express();

app.use(helmet());
const allowedOrigins = env.CORS_ORIGIN.split(',').map(url => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  })
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestIdMiddleware);
app.use(generalLimiter);

import path from 'path';

// ...
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Techno World Books API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  })
);

app.use('/uploads', express.static(path.resolve('uploads')));
app.use(routes);

app.use(errorHandler);

export default app;
