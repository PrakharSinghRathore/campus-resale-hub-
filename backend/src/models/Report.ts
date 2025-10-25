import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId;
  targetType: 'listing' | 'user';
  targetId: mongoose.Types.ObjectId;
  reason: string;
  details?: string;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema<IReport> = new Schema(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetType: { type: String, enum: ['listing', 'user'], required: true, index: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    reason: { type: String, required: true, maxlength: 200 },
    details: { type: String, maxlength: 2000 },
    status: { type: String, enum: ['open', 'reviewing', 'resolved', 'dismissed'], default: 'open', index: true },
  },
  { timestamps: true }
);

ReportSchema.index({ targetType: 1, targetId: 1 });

const Report: Model<IReport> = mongoose.model<IReport>('Report', ReportSchema);
export default Report;