import { Server, Socket } from 'socket.io';
import { Chat } from '../models/chat.model';

const setupChatSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Listen to 'sendMessage' event
    socket.on('sendMessage', async (data) => {
      const { username, message, room } = data;

      try {
        // Save the message to the correct room in MongoDB
        const chat = new Chat({ username, message, room });
        await chat.save();

        // Broadcast to the room
        io.to(room).emit('newMessage', chat);
      } catch (error) {
        console.error('Error saving chat:', error);
      }
    });

    // Handle user joining a room
    socket.on('joinRoom', async (data) => {
      const { room } = data;
      socket.join(room);

      // Send previous messages for the room
      try {
        const roomMessages = await Chat.find({ room }).sort({ createdAt: -1 });
        socket.emit('roomMessages', roomMessages);
        
        // Notify others that a user has joined the room
        socket.to(room).emit('newMessage', {
          username: 'System',
          message: `${socket.id} has joined the room.`,
        });
      } catch (error) {
        console.error('Error fetching room messages:', error);
      }
    });

    // Handle user leaving a room
    socket.on('leaveRoom', (room) => {
      socket.leave(room);
      socket.to(room).emit('newMessage', {
        username: 'System',
        message: `${socket.id} has left the room.`,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export default setupChatSocket;
