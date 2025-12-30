// import http from 'http';
// import app from './app';
// import { Server } from 'socket.io';
// import connectDB from './config/db';
// import chatService from './services/chat.service';

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: "http://localhost:4200" }
// });

// connectDB();

// // ក្នុង file app.ts ឬ server.ts របស់ backend
// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   socket.on('join_room', (room) => {
//     socket.join(room);
//     console.log(`User joined room: ${room}`);
//   });

//   socket.on('send_message', (data) => {
//     // បញ្ជូនសារទៅកាន់អ្នកគ្រប់គ្នាក្នុង Room នោះ (រួមទាំងអ្នកផ្ញើខ្លួនឯង)
//     io.to(data.room).emit('receive_message', data);
//   });
// });

// server.listen(3000, () => console.log('🚀 Server running on port https://localhost:3000'));





// import 'dotenv/config';
// import http from 'http';
// import { Server } from 'socket.io';
// import jwt from 'jsonwebtoken';
// import app from './app';
// import connectDB from './config/db';

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: process.env.CLIENT_URL || "http://localhost:4200" }
// });

// // Middleware សម្រាប់ឆែក Token លើ Socket
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (!token) return next(new Error("Authentication error"));

//   jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
//     if (err) return next(new Error("Authentication error"));
//     (socket as any).userId = decoded.userId;
//     next();
//   });
// });

// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   socket.on('join_room', (room) => {
//     socket.join(room);
//     console.log(`User ${(socket as any).userId} joined room: ${room}`);
//   });

//   socket.on('send_message', (data) => {
//     // បន្ថែម UserId ទៅក្នុងសារដើម្បីដឹងថាអ្នកណាជាអ្នកផ្ញើពិតប្រាកដ
//     const messagePayload = {
//       ...data,
//       senderId: (socket as any).userId,
//       createdAt: new Date()
//     };
//     io.to(data.room).emit('receive_message', messagePayload);
//   });
// });

// const PORT = process.env.PORT || 3000;
// connectDB().then(() => {
//   server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
// });



import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import app from './app';
import connectDB from './config/db';
// ១. នាំចូល chatService ដើម្បីប្រើប្រាស់មុខងារ saveMessage
import chatService from './services/chat.service'; 

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:4200" }
});

// Middleware សម្រាប់ឆែក Token លើ Socket
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) return next(new Error("Authentication error"));
    (socket as any).userId = decoded.userId;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${(socket as any).userId} joined room: ${room}`);
  });

  // ២. បន្ថែម async ដើម្បីអាចប្រើ await ក្នុងការ save ទិន្នន័យ
  socket.on('send_message', async (data) => {
    try {
      const messagePayload = {
        ...data,
        senderId: (socket as any).userId,
        // ធានាថា field name ត្រូវគ្នាជាមួយ IMessage interface (sender, content, room, timestamp)
        timestamp: new Date() 
      };

      // 🔥 ជំហានសំខាន់បំផុត៖ រក្សាទុកសារទៅក្នុង MongoDB
      // បើគ្មានបន្ទាត់នេះទេ ពេល Refresh នឹងបាត់សារជានិច្ច
      await chatService.saveMessage(messagePayload);

      // ៣. បញ្ជូនសារទៅកាន់អ្នកគ្រប់គ្នានៅក្នុង Room បន្ទាប់ពី Save ជោគជ័យ
      io.to(data.room).emit('receive_message', messagePayload);
      
    } catch (error) {
      console.error('Error saving message to DB:', error);
    }
  });
});

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});