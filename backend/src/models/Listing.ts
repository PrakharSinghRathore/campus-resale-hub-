import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IListing extends Document {
  sellerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  condition: string;
  hostelBlock: string;
  isActive: boolean;
  isSold: boolean;
  views: number;
  favoriteCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema: Schema<IListing> = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: 'text',
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
      index: 'text',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      max: 1000000,
      index: true,
    },
    images: [{
      type: String,
      required: true,
    }],
    category: {
      type: String,
      required: true,
      enum: [
        'Furniture',
        'Electronics',
        'Appliances', 
        'Books',
        'Clothing',
        'Sports',
        'Kitchen',
        'Decor',
        'Others'
      ],
      index: true,
    },
    condition: {
      type: String,
      required: true,
      enum: ['Like New', 'Excellent', 'Good', 'Fair'],
      index: true,
    },
    hostelBlock: {
      type: String,
      required: true,
      enum: ['Block A', 'Block B', 'Block C', 'Block D', 'Block E'],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isSold: {
      type: Boolean,
      default: false,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    favoriteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 50,
    }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
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

// Compound indexes for better query performance
ListingSchema.index({ sellerId: 1, isActive: 1 });
ListingSchema.index({ category: 1, condition: 1 });
ListingSchema.index({ hostelBlock: 1, isActive: 1 });
ListingSchema.index({ isActive: 1, createdAt: -1 });
ListingSchema.index({ price: 1, isActive: 1 });
ListingSchema.index({ isSold: 1, isActive: 1 });

// Text search index for title and description
ListingSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
}, {
  name: 'listing_text_search',
  weights: {
    title: 10,
    description: 5,
    tags: 2
  }
});

// Virtual for listing URL
ListingSchema.virtual('url').get(function() {
  return `/api/listings/${this._id}`;
});

// Virtual for primary image
ListingSchema.virtual('primaryImage').get(function() {
  return this.images && this.images.length > 0 ? this.images[0] : null;
});

// Instance methods
ListingSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

ListingSchema.methods.markAsSold = function() {
  this.isSold = true;
  this.isActive = false;
  return this.save();
};

ListingSchema.methods.markAsAvailable = function() {
  this.isSold = false;
  this.isActive = true;
  return this.save();
};

ListingSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

ListingSchema.methods.activate = function() {
  this.isActive = true;
  this.isSold = false;
  return this.save();
};

ListingSchema.methods.updateFavoriteCount = async function() {
  const User = mongoose.model('User');
  const count = await User.countDocuments({
    favoriteListings: this._id
  });
  this.favoriteCount = count;
  return this.save();
};

ListingSchema.methods.toListJSON = function() {
  return {
    id: this._id,
    sellerId: this.sellerId,
    title: this.title,
    description: this.description,
    price: this.price,
    images: this.images,
    category: this.category,
    condition: this.condition,
    hostelBlock: this.hostelBlock,
    isActive: this.isActive,
    isSold: this.isSold,
    views: this.views,
    favoriteCount: this.favoriteCount,
    tags: this.tags,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Static methods
ListingSchema.statics.findActive = function() {
  return this.find({ isActive: true, isSold: false });
};

ListingSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isActive: true, isSold: false });
};

ListingSchema.statics.findByHostelBlock = function(hostelBlock: string) {
  return this.find({ hostelBlock, isActive: true, isSold: false });
};

ListingSchema.statics.findBySeller = function(sellerId: mongoose.Types.ObjectId) {
  return this.find({ sellerId });
};

ListingSchema.statics.findByPriceRange = function(minPrice: number, maxPrice: number) {
  return this.find({
    price: { $gte: minPrice, $lte: maxPrice },
    isActive: true,
    isSold: false
  });
};

ListingSchema.statics.searchByText = function(searchText: string) {
  return this.find(
    { $text: { $search: searchText }, isActive: true, isSold: false },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

ListingSchema.statics.findRecentListings = function(limit: number = 10) {
  return this.find({ isActive: true, isSold: false })
    .sort({ createdAt: -1 })
    .limit(limit);
};

ListingSchema.statics.findPopularListings = function(limit: number = 10) {
  return this.find({ isActive: true, isSold: false })
    .sort({ favoriteCount: -1, views: -1 })
    .limit(limit);
};

// Pre-save middleware
ListingSchema.pre('save', function(next) {
  if (this.isNew) {
    // Auto-generate tags from title and description
    const words = (this.title + ' ' + this.description)
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    this.tags = [...new Set(words)].slice(0, 10); // Unique tags, max 10
  }
  
  // Ensure sold items are inactive
  if (this.isSold) {
    this.isActive = false;
  }
  
  next();
});

// Pre-remove middleware
ListingSchema.pre('findOneAndDelete', async function() {
  const listing = await this.model.findOne(this.getQuery());
  if (listing) {
    // Remove from users' favorite lists
    const User = mongoose.model('User');
    await User.updateMany(
      { favoriteListings: listing._id },
      { $pull: { favoriteListings: listing._id } }
    );
  }
});

const Listing: Model<IListing> = mongoose.model<IListing>('Listing', ListingSchema);

export default Listing;