import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  opening_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Opening', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  cover_note: { type: String, default: '' },
  full_name: { type: String, required: true },
  roll_number: { type: String, required: true },
  year: { type: String, required: true },
  department_name: { type: String, required: true },
  contact_number: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  applied_at: { type: Date, default: Date.now },
});

applicationSchema.index({ opening_id: 1, student_id: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
