import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import opportunitiesRoutes from './routes/opportunities.routes.js';
import industryRoutes from './routes/industry.routes.js';
import institutionRoutes from './routes/institution.routes.js';
import passportRoutes from './routes/passport.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'PlacePro Skill Intelligence API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/industry', industryRoutes);
app.use('/api/institution', institutionRoutes);
app.use('/api/passport', passportRoutes);

// Static Client Asset Serving (For unified single-service deployment)
const candidateDistPaths = [
  path.resolve(__dirname, '../../placepro/dist'),
  path.resolve(process.cwd(), 'placepro/dist'),
  path.resolve(process.cwd(), '../placepro/dist'),
  path.resolve(__dirname, '../placepro/dist')
];
const clientDist = candidateDistPaths.find(p => fs.existsSync(p));

if (clientDist) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404 handler for unmatched API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    code: 'NOT_FOUND'
  });
});

// Centralized Error Handling Middleware (Sanitizes stack traces and database internals)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || (statusCode === 400 ? 'INVALID_REQUEST' : 'INTERNAL_SERVER_ERROR');
  const message = err.message || 'An unexpected error occurred';

  // Log error internally in non-test mode
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[API Error] [${code}] ${statusCode}:`, err.stack || err.message);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error. Please try again later.'
      : message,
    code
  });
});

const isTestMode = process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('test') || arg.includes('vitest'));

if (!isTestMode) {
  app.listen(PORT, () => {
    console.log(`🚀 PlacePro API Server running on port ${PORT}`);
  });
}

export default app;
