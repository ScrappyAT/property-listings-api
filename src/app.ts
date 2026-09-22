import express from 'express';
import propertyRouter from './modules/properties/property.router';
import agentRouter from './modules/agents/agent.router';
import imageRouter from './modules/images/image.router';
import inquiryRouter from './modules/inquiries/inquiry.router';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/v1/properties', propertyRouter);
app.use('/api/v1/agents', agentRouter);
app.use('/api/v1/images', imageRouter);
app.use('/api/v1/inquiries', inquiryRouter);

// Centralized error handler MUST be registered after all route handlers
app.use(errorHandler);

export default app;
