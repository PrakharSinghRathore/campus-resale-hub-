import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  text: string;
  images?: string[];
  messageType: 'text' | 'image' | 'system';
  isRead: boolean;
  readBy: mongoose.Types.ObjectId[];
  readAt?: Date;
  editedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: function(this: IMessage) {
        return this.messageType === 'text' || this.messageType === 'system';
      },
      trim: true,
      maxlength: 2000,
    },
    images: [{
      type: String,
      validate: {
        validator: function(images: string[]) {
          return images.length <= 5; // Max 5 images per message
        },
        message: 'Maximum 5 images allowed per message'
      }
    }],
    messageType: {
      type: String,
      enum: ['text', 'image', 'system'],
      default: 'text',
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    readAt: {
      type: Date,
      default: null,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
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
MessageSchema.index({ chatId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });
MessageSchema.index({ chatId: 1, isRead: 1 });
MessageSchema.index({ chatId: 1, isDeleted: 1 });

// Virtual for message URL
MessageSchema.virtual('url').get(function() {
  return `/api/chats/${this.chatId}/messages/${this._id}`;
});

// Virtual to check if message is edited
MessageSchema.virtual('isEdited').get(function() {
  return !!this.editedAt;
});

// Virtual for message preview (shortened text)
MessageSchema.virtual('preview').get(function() {
  if (this.isDeleted) {
    return 'This message was deleted';
  }
  
  if (this.messageType === 'image') {
    return this.images && this.images.length > 0 ? 
      `📷 ${this.images.length} image(s)` : 
      'Image message';
  }
  
  if (this.messageType === 'system') {
    return this.text;
  }
  
  return this.text && this.text.length > 100 ? 
    this.text.substring(0, 100) + '...' : 
    this.text || '';
});

// Instance methods
MessageSchema.methods.markAsRead = function(userId: mongoose.Types.ObjectId) {
  if (!this.readBy.includes(userId)) {
    this.readBy.push(userId);
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

MessageSchema.methods.editMessage = function(newText: string) {
  if (this.messageType !== 'text') {
    throw new Error('Only text messages can be edited');
  }
  
  this.text = newText;
  this.editedAt = new Date();
  return this.save();
};

MessageSchema.methods.deleteMessage = function() {
  this.isDeleted = true;
  this.text = 'This message was deleted';
  this.images = [];
  return this.save();
};

MessageSchema.methods.isReadBy = function(userId: mongoose.Types.ObjectId): boolean {
  return this.readBy.some((id: mongoose.Types.ObjectId) => id.equals(userId));
};

MessageSchema.methods.canEdit = function(userId: mongoose.Types.ObjectId): boolean {
  return this.senderId.equals(userId) && 
         !this.isDeleted && 
         this.messageType === 'text' &&
         (Date.now() - this.createdAt.getTime()) < (15 * 60 * 1000); // 15 minutes
};

MessageSchema.methods.canDelete = function(userId: mongoose.Types.ObjectId): boolean {
  return this.senderId.equals(userId) && !this.isDeleted;
};

MessageSchema.methods.toMessageJSON = function() {
  return {
    id: this._id,
    chatId: this.chatId,
    senderId: this.senderId,
    text: this.text,
    images: this.images,
    messageType: this.messageType,
    isRead: this.isRead,
    readBy: this.readBy,
    readAt: this.readAt,
    editedAt: this.editedAt,
    isDeleted: this.isDeleted,
    isEdited: !!this.editedAt,
    preview: this.preview,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Static methods
MessageSchema.statics.findChatMessages = function(
  chatId: mongoose.Types.ObjectId, 
  limit: number = 50, 
  offset: number = 0
) {
  return this.find({ chatId, isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .populate('senderId', 'name avatar');
};

MessageSchema.statics.findUnreadMessages = function(chatId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) {
  return this.find({
    chatId,
    senderId: { $ne: userId },
    isRead: false,
    isDeleted: false
  });
};

MessageSchema.statics.markChatMessagesAsRead = function(chatId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) {
  return this.updateMany(
    {
      chatId,
      senderId: { $ne: userId },
      readBy: { $ne: userId },
      isDeleted: false
    },
    {
      $addToSet: { readBy: userId },
      $set: { 
        isRead: true,
        readAt: new Date()
      }
    }
  );
};

MessageSchema.statics.getMessageStats = function(chatId: mongoose.Types.ObjectId) {
  return this.aggregate([
    { $match: { chatId, isDeleted: false } },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        textMessages: { $sum: { $cond: [{ $eq: ['$messageType', 'text'] }, 1, 0] } },
        imageMessages: { $sum: { $cond: [{ $eq: ['$messageType', 'image'] }, 1, 0] } },
        systemMessages: { $sum: { $cond: [{ $eq: ['$messageType', 'system'] }, 1, 0] } },
        readMessages: { $sum: { $cond: ['$isRead', 1, 0] } },
        editedMessages: { $sum: { $cond: ['$editedAt', 1, 0] } }
      }
    }
  ]);
};

MessageSchema.statics.searchMessages = function(chatId: mongoose.Types.ObjectId, searchText: string) {
  return this.find({
    chatId,
    text: { $regex: searchText, $options: 'i' },
    isDeleted: false
  }).sort({ createdAt: -1 });
};

MessageSchema.statics.createSystemMessage = function(chatId: mongoose.Types.ObjectId, text: string) {
  const message = new this({
    chatId,
    senderId: null, // System messages don't have a sender
    text,
    messageType: 'system',
    isRead: true, // System messages are always considered read
  });
  
  return message.save();
};

// Pre-save middleware
MessageSchema.pre('save', async function(next) {
  // Update chat's last message info
  if (this.isNew && !this.isDeleted) {
    try {
      const Chat = mongoose.model('Chat');
      await (Chat as any).findByIdAndUpdate((this as any).chatId, {
        lastMessage: (this as any).preview,
        lastMessageAt: (this as any).createdAt,
        lastMessageSenderId: (this as any).senderId
      });
    } catch (error) {
      console.error('Error updating chat last message:', error);
    }
  }
  
  // Validate message content
  if (this.messageType === 'image' && (!this.images || this.images.length === 0)) {
    throw new Error('Image messages must have at least one image');
  }
  
  if (this.messageType === 'text' && (!this.text || this.text.trim().length === 0)) {
    throw new Error('Text messages must have content');
  }
  
  next();
});

// Post-save middleware
MessageSchema.post('save', async function(doc) {
  // Update chat's last message after saving
  if (doc.isNew && !doc.isDeleted) {
    try {
      const Chat = mongoose.model('Chat');
      const chat = await Chat.findById(doc.chatId);
      if (chat) {
        await chat.updateLastMessage(doc.text || '📷 Image', doc.senderId);
      }
    } catch (error) {
      console.error('Error updating chat after message save:', error);
    }
  }
});

const Message: Model<IMessage> = mongoose.model<IMessage>('Message', MessageSchema);

export default Message;