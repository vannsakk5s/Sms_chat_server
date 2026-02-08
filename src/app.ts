import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.routes';
import authRoutes from './routes/auth.routes';

const app = express();

const allowedOrigins = [
  'http://localhost:4200',
  'https://sms-group-396k.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"], 
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);

export default app;