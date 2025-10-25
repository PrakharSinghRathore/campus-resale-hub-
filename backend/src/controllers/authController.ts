import { Request, Response } from 'express';
import { updateUserProfileSchema } from '../utils/validators';

export const verify = async (req: Request, res: Response) => {
  return res.json({ ok: true });
};

export const me = async (req: Request, res: Response) => {
  return res.json({
    id: req.user!._id,
    email: req.user!.email,
    name: req.user!.name,
    avatar: req.user!.avatar,
    hostelBlock: req.user!.hostelBlock,
    rating: req.user!.rating,
    isAdmin: req.user!.isAdmin,
    createdAt: req.user!.createdAt,
  });
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const parsed = updateUserProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });
    }

    const updates = parsed.data;
    Object.assign(req.user!, updates);
    await req.user!.save();

    return res.json({ message: 'Profile updated', profile: req.user });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to update profile', message: e.message });
  }
};