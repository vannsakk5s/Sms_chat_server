import Message, { IMessageDocument } from '../models/Message';
import { IMessage } from '../interfaces/IMessage';

class ChatService {
  async saveMessage(data: IMessage): Promise<IMessageDocument> {
    const message = new Message(data);
    return await message.save();
  }

  async getMessagesByRoom(room: string): Promise<IMessageDocument[]> {
    return await Message.find({ room }).sort({ timestamp: 1 }).exec();
  }
}

export default new ChatService();