import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  registered_at: { type: Date, default: Date.now },
});

registrationSchema.index({ event_id: 1, student_id: 1 }, { unique: true });

export default mongoose.model('Registration', registrationSchema);
