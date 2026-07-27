import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import clubRoutes from './routes/clubs.js';
import achievementRoutes from './routes/achievements.js';
import openingRoutes from './routes/openings.js';
import eventRoutes from './routes/events.js';
import studentRoutes from './routes/student.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/clubs/:clubId/achievements', achievementRoutes);
app.use('/api/clubs/:clubId/openings', openingRoutes);
app.use('/api/clubs/:clubId/events', eventRoutes);
app.use('/api/applications', studentRoutes);
app.use('/api/registrations', studentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGODB_URI is not set. Seed and server require a valid MongoDB connection string in the environment.');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

