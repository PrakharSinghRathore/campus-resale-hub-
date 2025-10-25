import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { getListings, getStats, getUsers } from '../controllers/adminController';

const router = Router();

router.get('/users', authenticateToken, requireAdmin, getUsers);
router.get('/listings', authenticateToken, requireAdmin, getListings);
router.get('/stats', authenticateToken, requireAdmin, getStats);

export default router;