import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'clubOwner', 'admin'], required: true },
  college_id: { type: String, default: null },
  branch: { type: String, default: null },
  year: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model('Profile', profileSchema);
