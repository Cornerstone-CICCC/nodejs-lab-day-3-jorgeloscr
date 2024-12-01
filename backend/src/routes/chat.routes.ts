import express from 'express';
import chatController from '../controllers/chat.controller';

const chatRouter = express.Router();

// Get messages by room
chatRouter.get('/room/:room', chatController.getMessagesByRoom);

export default chatRouter;
