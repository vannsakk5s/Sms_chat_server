// import express from 'express';
// import cors from 'cors';
// import chatRoutes from './routes/chat.routes';
// import authRoutes from './routes/auth.routes';

// const app = express();
// app.use(cors({
//   origin: process.env.CLIENT_URL || "http://localhost:4200",
//   methods: ["GET", "POST"],
//   credentials: true
// }));
// app.use(express.json({ limit: '10kb' }));

// app.use('/api/chat', chatRoutes);
// app.use('/api/auth', authRoutes);

// export default app;

import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.routes';
import authRoutes from './routes/auth.routes';

const app = express();

// កែសម្រួល CORS ឱ្យទទួលយកទាំង localhost និង domain របស់ vercel
const allowedOrigins = [
  'http://localhost:4200',
  'https://sms-group-396k.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // អនុញ្ញាតឱ្យ request ដែលគ្មាន origin (ដូចជា mobile apps ឬ curl) ឬ origin ដែលមានក្នុងបញ្ជី
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"], // បន្ថែម methods ផ្សេងៗសម្រាប់ប្រើប្រាស់យូរអង្វែង
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);

export default app;