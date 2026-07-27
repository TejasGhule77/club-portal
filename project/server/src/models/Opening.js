import mongoose from 'mongoose';

const openingSchema = new mongoose.Schema({
  club_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  deadline: { type: Date, default: null },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model('Opening', openingSchema);
