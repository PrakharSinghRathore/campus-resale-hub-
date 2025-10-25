import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  name: string;
  avatar?: string;
  hostelBlock?: string;
  rating: number;
  ratingCount: number;
  isAdmin: boolean;
  isActive: boolean;
  lastActive: Date;
  favoriteListings: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    avatar: {
      type: String,
      default: null,
    },
    hostelBlock: {
      type: String,
      enum: ['Block A', 'Block B', 'Block C', 'Block D', 'Block E'],
      index: true,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1.0,
      max: 5.0,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    favoriteListings: [{
      type: Schema.Types.ObjectId,
      ref: 'Listing',
    }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.firebaseUid; // Don't expose Firebase UID in API responses
        return ret;
      },
    },
    toObject: {
      transform: function(doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for better performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ firebaseUid: 1 }, { unique: true });
UserSchema.index({ hostelBlock: 1 });
UserSchema.index({ isAdmin: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ lastActive: -1 });

// Virtual for user profile URL
UserSchema.virtual('profileUrl').get(function() {
  return `/api/users/${this._id}`;
});

// Instance methods
UserSchema.methods.toProfileJSON = function() {
  return {
    id: this._id,
    name: this.name,
    avatar: this.avatar,
    hostelBlock: this.hostelBlock,
    rating: this.rating,
    ratingCount: this.ratingCount,
    isActive: this.isActive,
    lastActive: this.lastActive,
    createdAt: this.createdAt,
  };
};

UserSchema.methods.addToFavorites = function(listingId: mongoose.Types.ObjectId) {
  if (!this.favoriteListings.includes(listingId)) {
    this.favoriteListings.push(listingId);
    return this.save();
  }
  return Promise.resolve(this);
};

UserSchema.methods.removeFromFavorites = function(listingId: mongoose.Types.ObjectId) {
  this.favoriteListings = this.favoriteListings.filter(
    (id: mongoose.Types.ObjectId) => !id.equals(listingId)
  );
  return this.save();
};

UserSchema.methods.updateRating = function(newRating: number) {
  const totalRating = this.rating * this.ratingCount + newRating;
  this.ratingCount += 1;
  this.rating = totalRating / this.ratingCount;
  return this.save();
};

// Static methods
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findByFirebaseUid = function(firebaseUid: string) {
  return this.findOne({ firebaseUid });
};

UserSchema.statics.findAdmins = function() {
  return this.find({ isAdmin: true, isActive: true });
};

UserSchema.statics.findByHostelBlock = function(hostelBlock: string) {
  return this.find({ hostelBlock, isActive: true });
};

// Pre-save middleware
UserSchema.pre('save', function(next) {
  if (this.isModified('lastActive') || this.isNew) {
    this.lastActive = new Date();
  }
  next();
});

// Pre-remove middleware
UserSchema.pre('findOneAndDelete', async function() {
  const user = await this.model.findOne(this.getQuery());
  if (user) {
    // Remove user from all chats
    await mongoose.model('Chat').updateMany(
      { participants: user._id },
      { $pull: { participants: user._id } }
    );
    
    // Deactivate user's listings
    await mongoose.model('Listing').updateMany(
      { sellerId: user._id },
      { isActive: false }
    );
  }
});

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;