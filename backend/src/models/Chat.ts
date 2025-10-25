import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  listingId?: mongoose.Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  lastMessageSenderId?: mongoose.Types.ObjectId;
  isActive: boolean;
  unreadCount: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema<IChat> = new Schema(
  {
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      default: null,
    },
    lastMessage: {
      type: String,
      default: null,
      maxlength: 500,
    },
    lastMessageAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastMessageSenderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        
        // Convert Map to Object for JSON serialization
        if (ret.unreadCount) {
          ret.unreadCount = Object.fromEntries(ret.unreadCount);
        }
        
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
ChatSchema.index({ participants: 1 });
ChatSchema.index({ lastMessageAt: -1 });
ChatSchema.index({ isActive: 1 });
ChatSchema.index({ listingId: 1 });

// Compound indexes
ChatSchema.index({ participants: 1, isActive: 1 });
ChatSchema.index({ participants: 1, lastMessageAt: -1 });

// Virtual for chat URL
ChatSchema.virtual('url').get(function() {
  return `/api/chats/${this._id}`;
});

// Instance methods
ChatSchema.methods.updateLastMessage = function(message: string, senderId: mongoose.Types.ObjectId) {
  this.lastMessage = message.length > 500 ? message.substring(0, 500) + '...' : message;
  this.lastMessageAt = new Date();
  this.lastMessageSenderId = senderId;
  
  // Update unread count for other participants
  this.participants.forEach((participantId: mongoose.Types.ObjectId) => {
    if (!participantId.equals(senderId)) {
      const currentCount = this.unreadCount.get(participantId.toString()) || 0;
      this.unreadCount.set(participantId.toString(), currentCount + 1);
    }
  });
  
  return this.save();
};

ChatSchema.methods.markAsRead = function(userId: mongoose.Types.ObjectId) {
  this.unreadCount.set(userId.toString(), 0);
  return this.save();
};

ChatSchema.methods.addParticipant = function(userId: mongoose.Types.ObjectId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    this.unreadCount.set(userId.toString(), 0);
    return this.save();
  }
  return Promise.resolve(this);
};

ChatSchema.methods.removeParticipant = function(userId: mongoose.Types.ObjectId) {
  this.participants = this.participants.filter(
    (id: mongoose.Types.ObjectId) => !id.equals(userId)
  );
  this.unreadCount.delete(userId.toString());
  
  // Deactivate chat if no participants left
  if (this.participants.length === 0) {
    this.isActive = false;
  }
  
  return this.save();
};

ChatSchema.methods.getUnreadCount = function(userId: mongoose.Types.ObjectId): number {
  return this.unreadCount.get(userId.toString()) || 0;
};

ChatSchema.methods.getTotalUnreadCount = function(): number {
  let total = 0;
  for (const count of this.unreadCount.values()) {
    total += count;
  }
  return total;
};

ChatSchema.methods.getOtherParticipant = function(userId: mongoose.Types.ObjectId) {
  return this.participants.find((id: mongoose.Types.ObjectId) => !id.equals(userId));
};

ChatSchema.methods.isParticipant = function(userId: mongoose.Types.ObjectId): boolean {
  return this.participants.some((id: mongoose.Types.ObjectId) => id.equals(userId));
};

ChatSchema.methods.toChatJSON = function() {
  return {
    id: this._id,
    participants: this.participants,
    listingId: this.listingId,
    lastMessage: this.lastMessage,
    lastMessageAt: this.lastMessageAt,
    lastMessageSenderId: this.lastMessageSenderId,
    isActive: this.isActive,
    unreadCount: Object.fromEntries(this.unreadCount),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Static methods
ChatSchema.statics.findByParticipants = function(participant1: mongoose.Types.ObjectId, participant2: mongoose.Types.ObjectId) {
  return this.findOne({
    participants: { $all: [participant1, participant2] },
    isActive: true
  });
};

ChatSchema.statics.findUserChats = function(userId: mongoose.Types.ObjectId) {
  return this.find({
    participants: userId,
    isActive: true
  }).sort({ lastMessageAt: -1 });
};

ChatSchema.statics.findChatsByListing = function(listingId: mongoose.Types.ObjectId) {
  return this.find({
    listingId,
    isActive: true
  }).sort({ createdAt: -1 });
};

ChatSchema.statics.createDirectChat = async function(participant1: mongoose.Types.ObjectId, participant2: mongoose.Types.ObjectId, listingId?: mongoose.Types.ObjectId) {
  // Check if chat already exists
  const existingChat = await (this as any).findByParticipants(participant1, participant2);
  if (existingChat) {
    return existingChat;
  }
  
  // Create new chat
  const unreadCount = new Map();
  unreadCount.set(participant1.toString(), 0);
  unreadCount.set(participant2.toString(), 0);
  
  const chat = new this({
    participants: [participant1, participant2],
    listingId,
    unreadCount,
  });
  
  return chat.save();
};

ChatSchema.statics.getActiveChatsCount = function() {
  return this.countDocuments({ isActive: true });
};

ChatSchema.statics.getUserUnreadChatsCount = function(userId: mongoose.Types.ObjectId) {
  return this.countDocuments({
    participants: userId,
    isActive: true,
    [`unreadCount.${userId.toString()}`]: { $gt: 0 }
  });
};

// Pre-save middleware
ChatSchema.pre('save', function(next) {
  // Ensure participants array has unique values
  if (this.isModified('participants')) {
    this.participants = [...new Set(this.participants.map(id => id.toString()))].map(id => new mongoose.Types.ObjectId(id));
  }
  
  // Initialize unread count for new participants
  this.participants.forEach((participantId: mongoose.Types.ObjectId) => {
    if (!this.unreadCount.has(participantId.toString())) {
      this.unreadCount.set(participantId.toString(), 0);
    }
  });
  
  next();
});

// Pre-remove middleware
ChatSchema.pre('findOneAndDelete', async function() {
  const chat = await this.model.findOne(this.getQuery());
  if (chat) {
    // Delete all messages in this chat
    await mongoose.model('Message').deleteMany({ chatId: chat._id });
  }
});

const Chat: Model<IChat> = mongoose.model<IChat>('Chat', ChatSchema);

export default Chat;