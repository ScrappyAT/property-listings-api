import express from 'express';
import cors from 'cors';
import propertyRouter from './modules/properties/property.router';
import agentRouter from './modules/agents/agent.router';
import imageRouter from './modules/images/image.router';
import inquiryRouter from './modules/inquiries/inquiry.router';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import { AppError } from './utils/errors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Apply rate limiting to all /api/v1 routes
app.use('/api/v1', apiRateLimiter);

app.use('/api/v1/properties', propertyRouter);
app.use('/api/v1/agents', agentRouter);
app.use('/api/v1/images', imageRouter);
app.use('/api/v1/inquiries', inquiryRouter);

// Catch-all handler for unmatched routes
app.use((_req, _res, next) => {
  next(new AppError(404, 'NOT_FOUND', 'Route not found.'));
});

// Centralized error handler MUST be registered after all route handlers
app.use(errorHandler);

export default app;
