// // import http from 'http';
// // import app from './app';
// // import { Server } from 'socket.io';
// // import connectDB from './config/db';
// // import chatService from './services/chat.service';

// // const server = http.createServer(app);
// // const io = new Server(server, {
// //   cors: { origin: "http://localhost:4200" }
// // });

// // connectDB();

// // // ក្នុង file app.ts ឬ server.ts របស់ backend
// // io.on('connection', (socket) => {
// //   console.log('User connected:', socket.id);

// //   socket.on('join_room', (room) => {
// //     socket.join(room);
// //     console.log(`User joined room: ${room}`);
// //   });

// //   socket.on('send_message', (data) => {
// //     // បញ្ជូនសារទៅកាន់អ្នកគ្រប់គ្នាក្នុង Room នោះ (រួមទាំងអ្នកផ្ញើខ្លួនឯង)
// //     io.to(data.room).emit('receive_message', data);
// //   });
// // });

// // server.listen(3000, () => console.log('🚀 Server running on port https://localhost:3000'));





// // import 'dotenv/config';
// // import http from 'http';
// // import { Server } from 'socket.io';
// // import jwt from 'jsonwebtoken';
// // import app from './app';
// // import connectDB from './config/db';

// // const server = http.createServer(app);
// // const io = new Server(server, {
// //   cors: { origin: process.env.CLIENT_URL || "http://localhost:4200" }
// // });

// // // Middleware សម្រាប់ឆែក Token លើ Socket
// // io.use((socket, next) => {
// //   const token = socket.handshake.auth.token;
// //   if (!token) return next(new Error("Authentication error"));

// //   jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
// //     if (err) return next(new Error("Authentication error"));
// //     (socket as any).userId = decoded.userId;
// //     next();
// //   });
// // });

// // io.on('connection', (socket) => {
// //   console.log('User connected:', socket.id);

// //   socket.on('join_room', (room) => {
// //     socket.join(room);
// //     console.log(`User ${(socket as any).userId} joined room: ${room}`);
// //   });

// //   socket.on('send_message', (data) => {
// //     // បន្ថែម UserId ទៅក្នុងសារដើម្បីដឹងថាអ្នកណាជាអ្នកផ្ញើពិតប្រាកដ
// //     const messagePayload = {
// //       ...data,
// //       senderId: (socket as any).userId,
// //       createdAt: new Date()
// //     };
// //     io.to(data.room).emit('receive_message', messagePayload);
// //   });
// // });

// // const PORT = process.env.PORT || 3000;
// // connectDB().then(() => {
// //   server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
// // });



// import 'dotenv/config';
// import http from 'http';
// import { Server } from 'socket.io';
// import jwt from 'jsonwebtoken';
// import app from './app';
// import connectDB from './config/db';
// // ១. នាំចូល chatService ដើម្បីប្រើប្រាស់មុខងារ saveMessage
// import chatService from './services/chat.service'; 

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

//   // ២. បន្ថែម async ដើម្បីអាចប្រើ await ក្នុងការ save ទិន្នន័យ
//   socket.on('send_message', async (data) => {
//     try {
//       const messagePayload = {
//         ...data,
//         senderId: (socket as any).userId,
//         // ធានាថា field name ត្រូវគ្នាជាមួយ IMessage interface (sender, content, room, timestamp)
//         timestamp: new Date() 
//       };

//       // 🔥 ជំហានសំខាន់បំផុត៖ រក្សាទុកសារទៅក្នុង MongoDB
//       // បើគ្មានបន្ទាត់នេះទេ ពេល Refresh នឹងបាត់សារជានិច្ច
//       await chatService.saveMessage(messagePayload);

//       // ៣. បញ្ជូនសារទៅកាន់អ្នកគ្រប់គ្នានៅក្នុង Room បន្ទាប់ពី Save ជោគជ័យ
//       io.to(data.room).emit('receive_message', messagePayload);

//     } catch (error) {
//       console.error('Error saving message to DB:', error);
//     }
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
import chatService from './services/chat.service';
import TelegramBot from 'node-telegram-bot-api';

const server = http.createServer(app);

// រៀបចំ Socket.io ជាមួយ CORS ចេញពី .env
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:4200",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// --- ១. រៀបចំ TELEGRAM BOT CONFIGURATION ---
const token = process.env.TELEGRAM_BOT_TOKEN as string;
if (!token) {
  console.error("❌ ERROR: TELEGRAM_BOT_TOKEN is missing in .env");
}

const bot = new TelegramBot(token, { polling: true });

// ស្ដាប់នៅពេល User ចុច /start ក្នុង Telegram App
bot.onText(/\/start/, async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const user = msg.from;

  console.log("🚀 Telegram Auth Received from:", user?.first_name);

  // ១. បង្កើត Payload សម្រាប់ JWT
  const payload = {
    userId: user?.id,
    username: user?.username,
    first_name: user?.first_name
  };

  // ២. បង្កើត authToken ជាមួយការការពារ Error TypeScript
  const authToken = jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    {
      expiresIn: (process.env.JWT_EXPIRES_IN as any) || '1d'
    }
  );

  // ៣. ពិនិត្យមើលស្ថានភាព Socket មុននឹងផ្ញើ (Debugging)
  const connectedCount = io.sockets.sockets.size;
  console.log(`📊 ចំនួនឧបករណ៍ដែលកំពុងភ្ជាប់ Socket ឥឡូវនេះ: ${connectedCount}`);

  // ៤. ផ្ញើសញ្ញាទៅ Frontend (Broadcast ទៅគ្រប់ Tab ដែលបើក)
  io.emit('telegram_auth_success', {
    token: authToken,
    user: payload
  });

  console.log("📡 បានផ្ញើសញ្ញា 'telegram_auth_success' ទៅកាន់ Frontend រួចរាល់។");

  // ៥. ផ្ញើសារត្រឡប់ទៅ Telegram វិញ
  bot.sendMessage(chatId, `🎉 សួស្តី ${user?.first_name}! អ្នកបានចូលប្រើប្រាស់ជោគជ័យ។\n\nសូមត្រឡប់ទៅពិនិត្យមើល Browser របស់អ្នកដើម្បីចាប់ផ្ដើមឆាត។`);
});

// --- ២. SOCKET.IO MIDDLEWARE (បានកែសម្រួលដើម្បីឱ្យ Login ដើរ) ---
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  // ប្រសិនបើគ្មាន Token (ករណីទើបបើកទំព័រ Login) យើងអនុញ្ញាតឱ្យភ្ជាប់សិន ដើម្បីចាំស្ដាប់សញ្ញាពី Bot
  if (!token) {
    console.log("⚠️ មិនទាន់មាន Token ទេ (Initial Connection) - អនុញ្ញាតឱ្យភ្ជាប់សិនសម្រាប់ការ Login");
    return next();
  }

  // ប្រសិនបើមាន Token យើងនឹងធ្វើការ Verify ដូចធម្មតា
  jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) {
      console.error("❌ JWT Verify Error:", err.message);
      // ទោះ Error ក៏ឱ្យវាភ្ជាប់ដែរ ដើម្បីកុំឱ្យគាំងទំព័រ Login ប៉ុន្តែ (socket as any).userId នឹងមិនមានតម្លៃឡើយ
      return next(); 
    }
    (socket as any).userId = decoded.userId;
    next();
  });
});

// --- ៣. SOCKET.IO CONNECTION (សម្រាប់ CHAT ROOM) ---
io.on('connection', (socket) => {
  console.log('👤 User connected to socket:', socket.id);

  socket.on('join_room', (room) => {
    // ឆែកមើលថា តើមាន UserId ដែរឬទេ (ការពារការ Chat ដោយគ្មាន Token)
    if (!(socket as any).userId) {
      console.warn("🚫 មិនអាច Join Room បានទេ: គ្មានការបញ្ជាក់អត្តសញ្ញាណត្រឹមត្រូវ");
      return;
    }
    socket.join(room);
    console.log(`🏠 User ${(socket as any).userId} joined room: ${room}`);
  });

  socket.on('send_message', async (data) => {
    try {
      if (!(socket as any).userId) throw new Error("Unauthorized user");

      const messagePayload = {
        ...data,
        senderId: (socket as any).userId,
        timestamp: new Date()
      };

      // រក្សាទុកក្នុង Database
      await chatService.saveMessage(messagePayload);

      // បញ្ជូនទៅកាន់អ្នកក្នុង Room
      io.to(data.room).emit('receive_message', messagePayload);

    } catch (error) {
      console.error('❌ Error saving/sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected');
  });
});

// --- ៤. START SERVER ---
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io allowed origin: ${process.env.CLIENT_URL}`);
  });
});