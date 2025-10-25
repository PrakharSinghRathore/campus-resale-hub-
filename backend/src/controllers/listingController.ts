import { Request, Response } from 'express';
import Listing from '../models/Listing';
import User from '../models/User';
import { createListingSchema, listListingsQuerySchema, updateListingSchema } from '../utils/validators';
import mongoose from 'mongoose';
import crypto from 'crypto';
import Purchase from '../models/Purchase';
import { getIO } from '../sockets/io';

export const getListings = async (req: Request, res: Response) => {
  try {
    const parsed = listListingsQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });

    const { search, category, condition, block, minPrice, maxPrice, page = '1', limit = '20', sort = 'recent' } = parsed.data;


    const query: any = { isActive: true, isSold: false };
    if (category && category !== 'All') query.category = category;
    if (condition && condition !== 'All') query.condition = condition;
    if (block && block !== 'All') query.hostelBlock = block;
    if (minPrice) query.price = { ...(query.price || {}), $gte: Number(minPrice) };
    if (maxPrice) query.price = { ...(query.price || {}), $lte: Number(maxPrice) };

    if (search) {
      query.$text = { $search: search };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const sortOptions: any =
      sort === 'price_low' ? { price: 1 } :
      sort === 'price_high' ? { price: -1 } :
      { createdAt: -1 };

    const [items, total] = await Promise.all([
      Listing.find(query).sort(sortOptions).skip((pageNum - 1) * limitNum).limit(limitNum),
      Listing.countDocuments(query),
    ]);

    const result = {
      items: items.map(i => (i as any).toListJSON()),
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    };

    return res.json(result);
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to fetch listings', message: e.message });
  }
};

export const getListingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid ID' });

    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

await (listing as any).incrementViews();
    return res.json(listing);
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to fetch listing', message: e.message });
  }
};


export const createListing = async (req: Request, res: Response) => {
  try {
    const parsed = createListingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });

    const listing = new Listing({ ...parsed.data, sellerId: req.user!._id, isActive: true, isSold: false });
    await listing.save();

    // Emit real-time event
    try {
      getIO().emit('new_listing', (listing as any).toListJSON());
    } catch {}

    return res.status(201).json({ message: 'Listing created', listing });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to create listing', message: e.message });
  }
};

export const updateListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid ID' });

    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

if (!(req.user as any)!.isAdmin && listing.sellerId.toString() !== (req.user as any)!._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const parsed = updateListingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });

    Object.assign(listing, parsed.data);
    await listing.save();

    // Emit real-time event
    try {
      getIO().emit('listing_update', (listing as any).toListJSON());
    } catch {}

    return res.json({ message: 'Listing updated', listing });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to update listing', message: e.message });
  }
};

export const deleteListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid ID' });

    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

if (!(req.user as any)!.isAdmin && listing.sellerId.toString() !== (req.user as any)!._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Listing.findByIdAndDelete(id);

    // Emit real-time event
    try {
      getIO().emit('listing_delete', { id });
    } catch {}

    return res.json({ message: 'Listing deleted' });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to delete listing', message: e.message });
  }
};

export const getMyListings = async (req: Request, res: Response) => {
  try {
    const items = await Listing.find({ sellerId: req.user!._id }).sort({ createdAt: -1 });
return res.json(items.map(i => (i as any).toListJSON()));
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to fetch user listings', message: e.message });
  }
};

export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid ID' });

    const listingId = new mongoose.Types.ObjectId(id);
    const user = await User.findById(req.user!._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const exists = user.favoriteListings.some(l => l.equals(listingId));
    if (exists) {
await (user as any).removeFromFavorites(listingId);
    } else {
await (user as any).addToFavorites(listingId);
    }

    // Update listing favorite count
    const listing = await Listing.findById(listingId);
if (listing) await (listing as any).updateFavoriteCount();

    return res.json({ message: exists ? 'Removed from favorites' : 'Added to favorites' });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to toggle favorite', message: e.message });
  }
};

// Generate a secure 6-digit OTP
const generateOTP = (): string => String(Math.floor(100000 + Math.random() * 900000));

const hashOTP = (otp: string, salt: string): string =>
  crypto.createHash('sha256').update(otp + ':' + salt).digest('hex');

export const initiatePurchase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // listing id
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid listing ID' });

    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (!listing.isActive || listing.isSold) return res.status(400).json({ error: 'Listing not available' });

    // Buyer is the authenticated user
    const buyer = req.user!;
    if ((listing.sellerId as any).equals((buyer as any)._id)) return res.status(400).json({ error: 'Seller cannot purchase own item' });

    // Invalidate previous pending purchases for this buyer and listing
    await Purchase.updateMany(
      { listingId: listing._id, buyerId: buyer._id, status: 'pending' },
      { $set: { status: 'cancelled' } }
    );

    const otp = generateOTP();
    const salt = crypto.randomBytes(12).toString('hex');
    const otpHash = hashOTP(otp, salt);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const purchase = new Purchase({
      listingId: listing._id,
      sellerId: listing.sellerId,
      buyerId: buyer._id,
      buyerFirebaseUid: req.firebaseUid!,
      otpHash,
      otpSalt: salt,
      expiresAt,
      status: 'pending',
    });
    await purchase.save();

    // Send OTP to buyer via Socket.IO (only to buyer)
    try {
      getIO().to(`user:${req.firebaseUid}`).emit('purchase_otp', {
        listingId: String(listing._id),
        otp,
        expiresAt: expiresAt.toISOString(),
      });
    } catch {}

    return res.status(200).json({ message: 'OTP sent to customer. Please share it with the seller to confirm.' });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to initiate purchase', message: e.message });
  }
};

export const verifyPurchase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // listing id
    const { code } = req.body as { code?: string };
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid listing ID' });
    if (!code || !/^[0-9]{6}$/.test(code)) return res.status(400).json({ error: 'Invalid OTP code' });

    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    // Only seller can verify
    if (listing.sellerId.toString() !== (req.user as any)!._id.toString() && !(req.user as any).isAdmin) {
      return res.status(403).json({ error: 'Only the seller can confirm receipt' });
    }

    const purchase = await Purchase.findOne({
      listingId: listing._id,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!purchase) return res.status(400).json({ error: 'No active purchase or OTP expired' });

    const computedHash = hashOTP(code, purchase.otpSalt);
    if (computedHash !== purchase.otpHash) {
      return res.status(400).json({ error: 'Incorrect OTP' });
    }

    // Mark as sold
    listing.isSold = true;
    listing.isActive = false;
    await listing.save();

    purchase.status = 'confirmed';
    await purchase.save();

    // Emit updates
    try {
      getIO().emit('listing_update', (listing as any).toListJSON());

      // Notify buyer and seller
      // Fetch seller user to get firebase uid
      // Buyer uid is stored in purchase
      // We may not have seller firebase uid readily; best-effort is to notify buyer only
      getIO().to(`user:${purchase.buyerFirebaseUid}`).emit('purchase_confirmed', {
        listingId: String(listing._id),
        status: 'confirmed',
      });
    } catch {}

    return res.json({ message: 'Purchase confirmed. Item marked as sold.', listing: (listing as any).toListJSON() });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to verify OTP', message: e.message });
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!._id).populate('favoriteListings');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const items = (user.favoriteListings as any[]).map((l: any) => ({
      id: l._id,
      title: l.title,
      price: l.price,
      images: l.images,
      category: l.category,
      condition: l.condition,
      hostelBlock: l.hostelBlock,
      isActive: l.isActive,
      isSold: l.isSold,
      createdAt: l.createdAt,
    }));

    return res.json(items);
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to fetch favorites', message: e.message });
  }
};