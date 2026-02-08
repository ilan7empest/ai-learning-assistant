import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotnev from 'dotenv/config';

import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/auth.route.js';
import documentRoutes from './routes/document.route.js';
import flashcardRoutes from './routes/flashcard.route.js';
import quizRoutes from './routes/quiz.route.js';
import progressRoutes from './routes/progress.route.js';
import aiRoutes from './routes/ai.route.js';

const PORT = process.env.PORT || 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define routes here
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('/*any', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// error handler
app.use(errorHandler);

app.use((err, req, res, next) => {
  if (err.status === 400) {
    return res.status(400).json({ error: err.message || 'Bad Request' });
  }

  if (err.status === 401) {
    return res.status(401).json({ error: err.message || 'Unauthorized' });
  }

  if (err.status === 403) {
    return res.status(403).json({ error: err.message || 'Forbidden' });
  }

  if (err.status === 404) {
    return res
      .status(404)
      .json({ success: false, error: 'Not Found', statusCode: 404 });
  }

  if (err.status === 500) {
    return res
      .status(500)
      .json({ error: err.message || 'Internal Server Error' });
  }

  next(err);
});

// Connect to the database
connectDB().then(() => {
  // Start the server
  app.listen(PORT, () => {
    console.log(
      `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    );
  });
});

process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
