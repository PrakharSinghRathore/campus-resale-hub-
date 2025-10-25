import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { verify, me, updateProfile } from '../controllers/authController';

const router = Router();

router.post('/verify', authenticateToken, verify);
router.get('/me', authenticateToken, me);
router.put('/me', authenticateToken, updateProfile);

export default router;