import { z } from 'zod';

// Auth
export const verifyTokenSchema = z.object({});

// Users
export const updateUserProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  hostelBlock: z.enum(['Block A', 'Block B', 'Block C', 'Block D', 'Block E']).optional(),
  avatar: z.string().url().optional(),
});

// Listings
export const createListingSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  price: z.number().min(0).max(1000000),
  images: z.array(z.string().url()).min(1).max(10),
  category: z.enum(['Furniture','Electronics','Appliances','Books','Clothing','Sports','Kitchen','Decor','Others']),
  condition: z.enum(['Like New', 'Excellent', 'Good', 'Fair']),
  hostelBlock: z.enum(['Block A', 'Block B', 'Block C', 'Block D', 'Block E']),
  tags: z.array(z.string()).optional(),
});

export const updateListingSchema = createListingSchema.partial();

export const listListingsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  condition: z.string().optional(),
  block: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
});

// Chats
export const createChatSchema = z.object({
  participantId: z.string().min(1),
  listingId: z.string().optional(),
});

export const sendMessageSchema = z.object({
  text: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  messageType: z.enum(['text', 'image', 'system']).default('text'),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListListingsQuery = z.infer<typeof listListingsQuerySchema>;
export type CreateChatInput = z.infer<typeof createChatSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
