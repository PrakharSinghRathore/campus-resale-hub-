import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Chat from '../models/Chat';
import Message from '../models/Message';
import User from '../models/User';
import { createChatSchema, sendMessageSchema } from '../utils/validators';

export const getChats = async (req: Request, res: Response) => {
  try {
    const chats = await Chat.find({ participants: req.user!._id, isActive: true })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'name avatar');

return res.json(chats.map(c => (c as any).toChatJSON()));
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to fetch chats', message: e.message });
  }
};

export const getOrCreateChat = async (req: Request, res: Response) => {
  try {
    const parsed = createChatSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });

    const participantId = new mongoose.Types.ObjectId(parsed.data.participantId);
    const listingId = parsed.data.listingId ? new mongoose.Types.ObjectId(parsed.data.listingId) : undefined;

if (participantId.equals((req.user as any)!._id)) {
      return res.status(400).json({ error: 'Cannot chat with yourself' });
    }

    // Ensure other participant exists
    const other = await User.findById(participantId);
    if (!other) return res.status(404).json({ error: 'User not found' });

    const chat = await (Chat as any).createDirectChat(req.user!._id, participantId, listingId);
    return res.json(chat.toChatJSON());
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to get or create chat', message: e.message });
  }
};

export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid chat ID' });

    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    if (!(chat as any).isParticipant(req.user!._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const messages = await (Message as any).findChatMessages(chat._id, 50, 0);
    return res.json(messages);
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to fetch messages', message: e.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid chat ID' });

    const parsed = sendMessageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });

    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    if (!(chat as any).isParticipant(req.user!._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const message = new Message({
      chatId: chat._id,
      senderId: req.user!._id,
      text: parsed.data.text || '',
      images: parsed.data.images || [],
      messageType: parsed.data.messageType,
      isRead: false,
      readBy: [req.user!._id],
    });

    await message.save();

    return res.status(201).json({ message: 'Message sent', data: message });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to send message', message: e.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid chat ID' });

    await (Message as any).markChatMessagesAsRead(new mongoose.Types.ObjectId(id), req.user!._id);
    const chat = await Chat.findById(id);
if (chat) await (chat as any).markAsRead((req.user as any)!._id);

    return res.json({ message: 'Messages marked as read' });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to mark as read', message: e.message });
  }
};