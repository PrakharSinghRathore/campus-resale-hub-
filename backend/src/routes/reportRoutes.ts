import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import Report from '../models/Report';
import mongoose from 'mongoose';

const router = Router();

// Create a new report
router.post('/', authenticateToken, async (req: any, res: any) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    if (!['listing', 'user'].includes(targetType)) return res.status(400).json({ error: 'Invalid targetType' });
    if (!mongoose.isValidObjectId(targetId)) return res.status(400).json({ error: 'Invalid targetId' });
    if (!reason || reason.length < 5) return res.status(400).json({ error: 'Reason too short' });

    const report = await Report.create({
      reporterId: req.user!._id,
      targetType,
      targetId,
      reason,
      details,
      status: 'open',
    });

return res.status(201).json({ message: 'Report submitted', report });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to submit report', message: e.message });
  }
});

// Admin: list reports
router.get('/', authenticateToken, requireAdmin, async (req: any, res: any) => {
  const { status = 'open' } = req.query;
  const reports = await Report.find(status ? { status } : {}).sort({ createdAt: -1 }).limit(500);
return res.json(reports);
});

// Admin: update report status
router.put('/:id', authenticateToken, requireAdmin, async (req: any, res: any) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
  const { status } = req.body;
  if (!['open', 'reviewing', 'resolved', 'dismissed'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const report = await Report.findByIdAndUpdate(id, { status }, { new: true });
  if (!report) return res.status(404).json({ error: 'Report not found' });
return res.json({ message: 'Report updated', report });
});

export default router;