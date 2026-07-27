import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  club_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: Date, default: null },
  image_url: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model('Achievement', achievementSchema);
