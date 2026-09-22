import express from 'express';
import propertyRouter from './modules/properties/property.router';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/v1/properties', propertyRouter);

// Centralized error handler MUST be registered after all route handlers
app.use(errorHandler);

export default app;
