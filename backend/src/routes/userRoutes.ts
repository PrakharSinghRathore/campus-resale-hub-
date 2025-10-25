import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { updateProfile } from '../controllers/authController';
import User from '../models/User';

const router = Router();

router.get('/profile', authenticateToken, async (req, res) => {
  return res.json(req.user);
});

router.put('/profile', authenticateToken, updateProfile);

router.get('/:id', authenticateToken, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
return res.json({
  id: user._id,
  name: user.name,
  avatar: (user as any).avatar,
  hostelBlock: (user as any).hostelBlock,
  rating: (user as any).rating,
  ratingCount: (user as any).ratingCount,
  isActive: (user as any).isActive,
  lastActive: (user as any).lastActive,
  createdAt: (user as any).createdAt,
});
});

export default router;