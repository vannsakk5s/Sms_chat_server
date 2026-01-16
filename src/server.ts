
import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import app from './app';
import connectDB from './config/db';
import chatService from './services/chat.service';
import TelegramBot from 'node-telegram-bot-api';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:4200",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const token = process.env.TELEGRAM_BOT_TOKEN as string;
if (!token) {
  console.error("❌ ERROR: TELEGRAM_BOT_TOKEN is missing in .env");
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const user = msg.from;

  console.log("🚀 Telegram Auth Received from:", user?.first_name);

  const payload = {
    userId: user?.id,
    username: user?.username,
    first_name: user?.first_name
  };

  const authToken = jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    {
      expiresIn: (process.env.JWT_EXPIRES_IN as any) || '1d'
    }
  );

  const connectedCount = io.sockets.sockets.size;
  console.log(`📊 ចំនួនឧបករណ៍ដែលកំពុងភ្ជាប់ Socket ឥឡូវនេះ: ${connectedCount}`);

  io.emit('telegram_auth_success', {
    token: authToken,
    user: payload
  });

  console.log("📡 បានផ្ញើសញ្ញា 'telegram_auth_success' ទៅកាន់ Frontend រួចរាល់។");

  bot.sendMessage(chatId, `🎉 សួស្តី ${user?.first_name}! អ្នកបានចូលប្រើប្រាស់ជោគជ័យ។\n\nសូមត្រឡប់ទៅពិនិត្យមើល Browser របស់អ្នកដើម្បីចាប់ផ្ដើមឆាត។`);
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    console.log("⚠️ មិនទាន់មាន Token ទេ (Initial Connection) - អនុញ្ញាតឱ្យភ្ជាប់សិនសម្រាប់ការ Login");
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) {
      console.error("❌ JWT Verify Error:", err.message);
      return next();
    }
    (socket as any).userId = decoded.userId;
    next();
  });
});

let waitingPlayer: { socketId: any; gameId: any; user: any } | null = null;
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  socket.on('join_room', (room) => {
    if (!(socket as any).userId) return;
    socket.join(room);
    console.log(`🏠 User ${(socket as any).userId} joined chat: ${room}`);
  });

  socket.on('send_message', async (data) => {
    try {
      if (!(socket as any).userId) throw new Error("Unauthorized");
      const messagePayload = { ...data, senderId: (socket as any).userId, timestamp: new Date() };
      await chatService.saveMessage(messagePayload);

      io.to(data.room).emit('receive_message', messagePayload);
    } catch (error) {
      console.error('❌ Chat Error:', error);
    }
  });

  socket.on('find_match', () => {
    // ១. ឆែកមើលថា តើមានអ្នកលេងកំពុងរង់ចាំ ហើយមិនមែនជាខ្លួនឯងឬទេ?
    if (waitingPlayer && waitingPlayer.socketId !== socket.id) {
      const gameId = waitingPlayer.gameId;
      const roomName = `chess_${gameId}`;

      // ឱ្យអ្នកលេងទី២ ចូលក្នុង Room ជាមួយអ្នកលេងទី១
      socket.join(roomName);

      // ២. បញ្ជូនសញ្ញាទៅអ្នកទី១ (ស)
      io.to(waitingPlayer.socketId).emit('match_found', {
        gameId: gameId,
        side: 'w'
      });

      // ៣. បញ្ជូនសញ្ញាទៅអ្នកទី២ (ខ្មៅ)
      socket.emit('match_found', {
        gameId: gameId,
        side: 'b'
      });

      console.log(`🎮 Match Found: Room ${gameId}`);
      waitingPlayer = null; // សម្អាតអ្នកចាំ ដើម្បីទទួលគូថ្មី
    }
    else {
      // បើគ្មានអ្នកចាំ ឬជាមនុស្សដដែលចុចស្ទួន
      const newGameId = Math.random().toString(36).substring(2, 9);

      waitingPlayer = {
        socketId: socket.id,
        gameId: newGameId,
        user: (socket as any).userId // ប្រាកដថាមានព័ត៌មាន user
      };

      socket.join(`chess_${newGameId}`);
      socket.emit('waiting_for_opponent');
      console.log(`⏳ User ${socket.id} is waiting in room ${newGameId}`);
    }
  });

  socket.on('join_chess_game', (gameId) => {
    socket.join(`chess_${gameId}`);
    socket.to(`chess_${gameId}`).emit('player_joined');
  });

  socket.on('make_chess_move', (data) => {
    // ត្រូវប្រើ socket.to(...) ដើម្បីផ្ញើទៅកាន់តែមនុស្សក្នុង Room នោះប៉ុណ្ណោះ
    socket.to(`chess_${data.gameId}`).emit('opponent_moved', {
      from: data.from,
      to: data.to,
      promotion: data.promotion
    });
  });

  const handleLeaveGame = () => {
    // រកមើលគ្រប់ Room ដែល Socket នេះកំពុងនៅ (ក្រៅពី Room ផ្ទាល់ខ្លួនរបស់វា)
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room.startsWith('chess_')) {
        // ១. ប្រាប់អ្នកនៅក្នុង Room នោះថា គូប្រកួតបានចាកចេញហើយ
        socket.to(room).emit('opponent_left');

        // ២. ឱ្យគ្រប់គ្នាដែលនៅសល់ (បើមាន) ចាកចេញពី Room នេះ
        // នេះនឹងជួយ Clear បន្ទប់ពី Memory របស់ Server
        io.in(room).socketsLeave(room);

        console.log(`🧹 Room ${room} ត្រូវបានសម្អាតដោយសារអ្នកលេងចាកចេញ`);
      }
    });

    // ៣. បើ User ហ្នឹងគឺជាអ្នកដែលកំពុងចាំ (waitingPlayer) ត្រូវលុបគាត់ចេញដែរ
    if (waitingPlayer && waitingPlayer.socketId === socket.id) {
      waitingPlayer = null;
      console.log('⏳ Waiting player បានចាកចេញ - សម្អាត queue');
    }
  };

  // ស្ដាប់នៅពេល User ចុចចាកចេញដោយផ្ទាល់ (ឧទាហរណ៍៖ ប៊ូតុង Back)
  socket.on('leave_game', handleLeaveGame);

  // ស្ដាប់នៅពេល User បិទ Browser ឬដាច់ Internet
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
    handleLeaveGame();
  });
});


const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io allowed origin: ${process.env.CLIENT_URL}`);
  });
});