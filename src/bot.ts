import TelegramBot from 'node-telegram-bot-api';

// ទាញយក Token ពី .env
const token = process.env.TELEGRAM_BOT_TOKEN as string;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is missing in .env file");
}

// បង្កើត instance របស់ Bot
const bot = new TelegramBot(token, { polling: true });

export const initTelegramBot = (io: any) => {
  bot.onText(/\/start/, (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;
    const user = msg.from;

    console.log("User started bot:", user);

    // ប្រាប់ទៅ Frontend តាមរយៈ Socket.io ថា User បានចុច Start ហើយ
    io.emit('telegram_auth_success', {
      id: user?.id,
      first_name: user?.first_name,
      username: user?.username
    });

    bot.sendMessage(chatId, `សួស្តី ${user?.first_name}! ការភ្ជាប់គណនីបានជោគជ័យ។ សូមត្រឡប់ទៅកាន់វេបសាយវិញ។`);
  });
};

export default bot;