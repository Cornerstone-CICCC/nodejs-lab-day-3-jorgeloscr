"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chat_model_1 = require("../models/chat.model");
const setupChatSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);
        // Listen to 'sendMessage' event
        socket.on('sendMessage', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { username, message, room } = data;
            try {
                // Save the message to the correct room in MongoDB
                const chat = new chat_model_1.Chat({ username, message, room });
                yield chat.save();
                // Broadcast to the room
                io.to(room).emit('newMessage', chat);
            }
            catch (error) {
                console.error('Error saving chat:', error);
            }
        }));
        // Handle user joining a room
        socket.on('joinRoom', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { room } = data;
            socket.join(room);
            // Send previous messages for the room
            try {
                const roomMessages = yield chat_model_1.Chat.find({ room }).sort({ createdAt: -1 });
                socket.emit('roomMessages', roomMessages);
                // Notify others that a user has joined the room
                socket.to(room).emit('newMessage', {
                    username: 'System',
                    message: `${socket.id} has joined the room.`,
                });
            }
            catch (error) {
                console.error('Error fetching room messages:', error);
            }
        }));
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
exports.default = setupChatSocket;
