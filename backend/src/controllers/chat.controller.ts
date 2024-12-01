import { Request, Response } from 'express';
import { Chat } from '../models/chat.model';


const getMessagesByRoom = async (req: Request, res: Response) => {
  try {
    const { room } = req.params;
    const chats = await Chat.find({ room }).sort({ createdAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages for room' });
  }
};

export default {
  getMessagesByRoom,
};
