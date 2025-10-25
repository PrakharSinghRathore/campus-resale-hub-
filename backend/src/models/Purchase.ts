import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPurchase extends Document {
  listingId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  buyerFirebaseUid: string;
  otpHash: string;
  otpSalt: string;
  expiresAt: Date;
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema: Schema<IPurchase> = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    buyerFirebaseUid: { type: String, required: true },
    otpHash: { type: String, required: true },
    otpSalt: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    status: { type: String, enum: ['pending', 'confirmed', 'expired', 'cancelled'], default: 'pending', index: true },
  },
  { timestamps: true }
);

PurchaseSchema.index({ listingId: 1, status: 1 });
PurchaseSchema.index({ buyerId: 1, status: 1 });

const Purchase: Model<IPurchase> = mongoose.model<IPurchase>('Purchase', PurchaseSchema);
export default Purchase;