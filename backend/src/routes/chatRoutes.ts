import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getChats, getChatMessages, getOrCreateChat, markAsRead, sendMessage } from '../controllers/chatController';

const router = Router();

router.get('/', authenticateToken, getChats);
router.post('/with', authenticateToken, getOrCreateChat);
router.get('/:id/messages', authenticateToken, getChatMessages);
router.post('/:id/messages', authenticateToken, sendMessage);
router.put('/:id/read', authenticateToken, markAsRead);

export default router;