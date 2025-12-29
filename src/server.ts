import http from 'http';
import app from './app';
import { Server } from 'socket.io';
import connectDB from './config/db';
import chatService from './services/chat.service';

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:4200" }
});

connectDB();

// ក្នុង file app.ts ឬ server.ts របស់ backend
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('send_message', (data) => {
    // បញ្ជូនសារទៅកាន់អ្នកគ្រប់គ្នាក្នុង Room នោះ (រួមទាំងអ្នកផ្ញើខ្លួនឯង)
    io.to(data.room).emit('receive_message', data);
  });
});

server.listen(3000, () => console.log('🚀 Server running on port https://localhost:3000'));