import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.routes';
import authRoutes from './routes/auth.routes';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);

export default app;