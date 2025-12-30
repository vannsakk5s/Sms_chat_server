import Message, { IMessageDocument } from '../models/Message';
import { IMessage } from '../interfaces/IMessage';

class ChatService {
  async saveMessage(data: IMessage): Promise<IMessageDocument> {
    const message = new Message(data);
    return await message.save();
  }

  async getMessagesByRoom(room: string, username: string): Promise<IMessageDocument[]> {
    // ប្រសិនបើមាន username គឺទាញយកតែសាររបស់ User នោះ
    const query: any = { room };
    if (username) {
      query.sender = username;
    }
    return await Message.find(query).sort({ timestamp: 1 }).exec();
  }
}

export default new ChatService();