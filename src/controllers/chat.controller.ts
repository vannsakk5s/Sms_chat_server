import { Request, Response } from 'express';
import chatService from '../services/chat.service';

export const getHistory = async (req: Request, res: Response) => {
  try {
    const messages = await chatService.getMessagesByRoom(req.params.room);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};