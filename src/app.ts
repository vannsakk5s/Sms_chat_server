import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.routes';
import authRoutes from './routes/auth.routes';

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:4200",
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));

app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);

export default app;