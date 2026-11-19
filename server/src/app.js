import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { env } from './config/env.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiError } from './utils/ApiError.js';

// Route imports
import authRouter from './modules/auth/auth.routes.js';
import userRouter from './modules/users/user.routes.js';
import habitRouter from './modules/habits/habit.routes.js';
import habitLogRouter from './modules/habitLogs/habitLog.routes.js';
import analyticsRouter from './modules/analytics/analytics.routes.js';
import goalRouter from './modules/goals/goal.routes.js';
import journalRouter from './modules/journal/journal.routes.js';
import achievementRouter from './modules/achievements/achievement.routes.js';
import notificationRouter from './modules/notifications/notification.routes.js';
import exportRouter from './modules/export/export.routes.js';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      // Allow localhost or configured CLIENT_URL
      if (
        origin === env.CLIENT_URL ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(new ApiError(403, 'CORS origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'HabitOS API',
  });
});

// API Rate Limiting for general endpoints
app.use('/api', apiRateLimiter);

// Mount modular API routers
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/habits', habitRouter);
app.use('/api/habit-logs', habitLogRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/goals', goalRouter);
app.use('/api/journal', journalRouter);
app.use('/api/achievements', achievementRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/export', exportRouter);

// Handle unknown API routes (404)
app.use((req, res, next) => {
  next(new ApiError(404, `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`));
});

// Centralized error handler
app.use(errorHandler);

export default app;
