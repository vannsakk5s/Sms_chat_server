
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
    if (waitingPlayer && waitingPlayer.socketId !== socket.id) {
      const gameId = waitingPlayer.gameId;
      const roomName = `chess_${gameId}`;
      socket.join(roomName);
      io.to(waitingPlayer.socketId).emit('match_found', {
        gameId: gameId,
        side: 'w'
      });

      
      socket.emit('match_found', {
        gameId: gameId,
        side: 'b'
      });

      console.log(`🎮 Match Found: Room ${gameId}`);
      waitingPlayer = null;
    }
    else {
 
      const newGameId = Math.random().toString(36).substring(2, 9);

      waitingPlayer = {
        socketId: socket.id,
        gameId: newGameId,
        user: (socket as any).userId 
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
    socket.to(`chess_${data.gameId}`).emit('opponent_moved', {
      from: data.from,
      to: data.to,
      promotion: data.promotion
    });
  });

  const handleLeaveGame = () => {
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room.startsWith('chess_')) {
        socket.to(room).emit('opponent_left');
        io.in(room).socketsLeave(room);

        console.log(`🧹 Room ${room} ត្រូវបានសម្អាតដោយសារអ្នកលេងចាកចេញ`);
      }
    });

    if (waitingPlayer && waitingPlayer.socketId === socket.id) {
      waitingPlayer = null;
      console.log('⏳ Waiting player បានចាកចេញ - សម្អាត queue');
    }
  };

  socket.on('send_chat_message', (data) => {
    socket.to(`chess_${data.gameId}`).emit('receive_chat_message', {
      message: data.message
    });
  });

  socket.on('request_rematch', (data) => {
    socket.to(`chess_${data.gameId}`).emit('rematch_requested');
  });

  socket.on('respond_rematch', (data) => {
    io.in(`chess_${data.gameId}`).emit('rematch_result', {
      accept: data.accept
    });
  });

  socket.on('leave_game', handleLeaveGame);

  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
    handleLeaveGame();
  });
});


//==================================//
//           TIC TAC TOE            //
//==================================//

let waitingTicTacToePlayer: { socketId: string; gameId: string; user: any } | null = null;

io.on('connection', (socket) => {

  socket.on('find_tictactoe_match', () => {
    if (waitingTicTacToePlayer && waitingTicTacToePlayer.socketId !== socket.id) {
      const gameId = waitingTicTacToePlayer.gameId;
      const roomName = `tictactoe_${gameId}`; 

      socket.join(roomName);

      io.to(waitingTicTacToePlayer.socketId).emit('tictactoe_match_found', {
        gameId: gameId,
        side: 'X'
      });

      socket.emit('tictactoe_match_found', {
        gameId: gameId,
        side: 'O'
      });

      console.log(`❌⭕ Tic-Tac-Toe Match Found: Room ${gameId}`);
      waitingTicTacToePlayer = null;
    } else {
      const newGameId = Math.random().toString(36).substring(2, 9);

      waitingTicTacToePlayer = {
        socketId: socket.id,
        gameId: newGameId,
        user: (socket as any).userId
      };

      socket.join(`tictactoe_${newGameId}`);
      console.log(`⏳ User ${socket.id} waiting for Tic-Tac-Toe in room ${newGameId}`);
    }
  });

  socket.on('tictactoe_move', (data) => {
    socket.to(`tictactoe_${data.gameId}`).emit('tictactoe_opponent_move', {
      index: data.index,
      player: data.player
    });
  });

  socket.on('cancel_tictactoe_search', () => {
    if (waitingTicTacToePlayer && waitingTicTacToePlayer.socketId === socket.id) {
      waitingTicTacToePlayer = null;
      console.log('🚫 Tic-Tac-Toe search canceled');
    }
  });

});


const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io allowed origin: ${process.env.CLIENT_URL}`);
  });
});