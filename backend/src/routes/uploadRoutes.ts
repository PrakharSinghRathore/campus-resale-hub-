import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { configureCloudinary } from '../config/cloudinary';

const router = Router();

router.post('/signature', authenticateToken, async (req: any, res: any) => {
  try {
    const cloudinary = configureCloudinary();
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder: 'campus-resale-hub',
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string
    );

    res.json({
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: 'campus-resale-hub',
    });
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to create signature', message: e.message });
  }
});

export default router;