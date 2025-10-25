import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { createListing, deleteListing, getFavorites, getListingById, getListings, getMyListings, toggleFavorite, updateListing, initiatePurchase, verifyPurchase } from '../controllers/listingController';

const router = Router();

router.get('/', authenticateToken, getListings);
router.post('/', authenticateToken, createListing);
router.get('/my', authenticateToken, getMyListings);
router.get('/favorites', authenticateToken, getFavorites);
router.get('/:id', authenticateToken, getListingById);
router.put('/:id', authenticateToken, updateListing);
router.delete('/:id', authenticateToken, deleteListing);
router.post('/:id/favorite', authenticateToken, toggleFavorite);
router.post('/:id/purchase/initiate', authenticateToken, initiatePurchase);
router.post('/:id/purchase/verify', authenticateToken, verifyPurchase);

export default router;