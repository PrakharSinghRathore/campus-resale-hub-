import { Request, Response } from 'express';
import User from '../models/User';
import Listing from '../models/Listing';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).limit(200);
    return res.json(users);
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to fetch users', message: e.message });
  }
};

export const getListings = async (req: Request, res: Response) => {
  try {
    const listings = await Listing.find({}).sort({ createdAt: -1 }).limit(500);
    return res.json(listings);
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to fetch listings', message: e.message });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const [users, listings] = await Promise.all([
      User.countDocuments({}),
      Listing.countDocuments({}),
    ]);

    return res.json({ users, listings });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to fetch stats', message: e.message });
  }
};