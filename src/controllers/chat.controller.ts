import { Request, Response } from 'express';
import chatService from '../services/chat.service';
import Message from 'src/models/Message';

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { room } = req.params;
    const { username, since } = req.query;

    const query: any = { room };
    
    if (username) {
      query.sender = username;
    }

    // ប្រសិនបើមានបញ្ជូនម៉ោង Login មក គឺទាញតែសារក្រោយម៉ោងនោះ
    if (since) {
      query.timestamp = { $gte: new Date(since as string) };
    }

    const messages = await Message.find(query).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};