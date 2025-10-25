import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyIdToken } from '../config/firebase';
import Chat from '../models/Chat';
import Message from '../models/Message';
import mongoose from 'mongoose';

interface AuthedSocket extends Socket {
  userId?: string;
}

export const initializeSocketIO = (io: SocketIOServer) => {
  io.use(async (socket: AuthedSocket, next) => {
    try {
      const token = (socket.handshake.auth as any)?.token;
      if (!token) return next(new Error('No token provided'));

      const decoded = await verifyIdToken(token);
      socket.userId = decoded.uid;
      next();
    } catch (e) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthedSocket) => {
    const uid = socket.userId;
    if (!uid) {
      socket.emit('auth_error', { message: 'Unauthenticated' });
      socket.disconnect();
      return;
    }

    socket.join(`user:${uid}`);

    socket.on('join_chat', async ({ chatId }) => {
      if (!chatId) return;
      // Allow special community room
      if (chatId !== 'community' && !mongoose.isValidObjectId(chatId)) return;
      socket.join(`chat:${chatId}`);
      io.to(`chat:${chatId}`).emit('user_online', { userId: uid });
    });

    socket.on('leave_chat', async ({ chatId }) => {
      if (!chatId) return;
      if (chatId !== 'community' && !mongoose.isValidObjectId(chatId)) return;
      socket.leave(`chat:${chatId}`);
      io.to(`chat:${chatId}`).emit('user_offline', { userId: uid });
    });

    socket.on('typing_start', ({ chatId }) => {
      if (!chatId) return;
      socket.to(`chat:${chatId}`).emit('user_typing', { userId: uid, chatId });
    });

    socket.on('typing_stop', ({ chatId }) => {
      if (!chatId) return;
      socket.to(`chat:${chatId}`).emit('user_stopped_typing', { userId: uid, chatId });
    });

    socket.on('send_message', async ({ chatId, text, images }) => {
      try {
        if (!chatId) return;

        // Community chat: broadcast without persistence
        if (chatId === 'community') {
          io.to('chat:community').emit('new_message', {
            chatId,
            text: text || '',
            images: images || [],
            createdAt: new Date().toISOString(),
          });
          return;
        }

        if (!mongoose.isValidObjectId(chatId)) return;

        const message = new Message({
          chatId: new mongoose.Types.ObjectId(chatId),
          senderId: null, // We don't have Mongo user id here; clients should call REST to persist
          text: text || '',
          images: images || [],
          messageType: images?.length ? 'image' : 'text',
          isRead: false,
          readBy: [],
        });

        // Broadcast to chat participants (optimistic UI)
        io.to(`chat:${chatId}`).emit('new_message', {
          chatId,
          text: message.text,
          images: message.images,
          createdAt: new Date().toISOString(),
        });
      } catch (e) {
        console.error('send_message failed', e);
      }
    });

    socket.on('disconnect', () => {
      // Could broadcast presence updates here per joined rooms if needed
    });
  });
};
