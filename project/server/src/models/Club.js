import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  logo_url: { type: String, default: '' },
  category: { type: String, enum: ['technical', 'cultural', 'sports', 'literary', 'social', 'other'], default: 'other' },
  faculty_advisor: { type: String, default: '' },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejection_reason: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
  
  // New fields
  presidentName: { type: String, default: '' },
  presidentPhoto: { type: String, default: '' },
  presidentEmail: { type: String, default: '' },
  presidentPhone: { type: String, default: '' },
  facultyName: { type: String, default: '' },
  facultyPhone: { type: String, default: '' },
  clubEmail: { type: String, default: '' },
  clubPhone: { type: String, default: '' },
  instagram: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  website: { type: String, default: '' },
  establishedYear: { type: Number, default: null },
  memberCount: { type: Number, default: 0 },
  achievementsCount: { type: Number, default: 0 },
  upcomingEventsCount: { type: Number, default: 0 },
  banner_url: { type: String, default: '' },
  gallery: { type: [String], default: [] },
});

export default mongoose.model('Club', clubSchema);
