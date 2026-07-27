import { Router } from 'express';
import Club from '../models/Club.js';
import Achievement from '../models/Achievement.js';
import Opening from '../models/Opening.js';
import Event from '../models/Event.js';
import Profile from '../models/Profile.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/clubs?status=approved
router.get('/', async (req, res) => {
  try {
    const status = req.query.status || 'approved';
    const filter = status === 'all' ? {} : { status };
    const clubs = await Club.find(filter).sort({ created_at: -1 });
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/clubs/:id
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    const owner = await Profile.findById(club.owner_id).select('-password');
    res.json({ ...club.toObject(), owner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/clubs/:id/details (achievements, openings, events)
router.get('/:id/details', async (req, res) => {
  try {
    const [achievements, openings, events] = await Promise.all([
      Achievement.find({ club_id: req.params.id }).sort({ date: -1 }),
      Opening.find({ club_id: req.params.id }).sort({ created_at: -1 }),
      Event.find({ club_id: req.params.id }).sort({ date: -1 }),
    ]);
    res.json({ achievements, openings, events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/clubs
router.post('/', requireAuth, requireRole('clubOwner'), async (req, res) => {
  try {
    const existing = await Club.findOne({ owner_id: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You already have a club' });
    }
    const club = await Club.create({
      ...req.body,
      owner_id: req.user._id,
      status: 'pending',
    });
    res.status(201).json(club);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/clubs/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    if (club.owner_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const {
      name, description, logo_url, category, faculty_advisor,
      presidentName, presidentPhoto, presidentEmail, presidentPhone,
      facultyName, facultyPhone, clubEmail, clubPhone,
      instagram, linkedin, github, website,
      establishedYear, memberCount, achievementsCount, upcomingEventsCount,
      banner_url, gallery
    } = req.body;
    if (name !== undefined) club.name = name;
    if (description !== undefined) club.description = description;
    if (logo_url !== undefined) club.logo_url = logo_url;
    if (category !== undefined) club.category = category;
    
    // Sync facultyAdvisor and facultyName
    if (faculty_advisor !== undefined) {
      club.faculty_advisor = faculty_advisor;
      club.facultyName = faculty_advisor;
    }
    if (facultyName !== undefined) {
      club.facultyName = facultyName;
      club.faculty_advisor = facultyName;
    }
    
    // New fields
    if (presidentName !== undefined) club.presidentName = presidentName;
    if (presidentPhoto !== undefined) club.presidentPhoto = presidentPhoto;
    if (presidentEmail !== undefined) club.presidentEmail = presidentEmail;
    if (presidentPhone !== undefined) club.presidentPhone = presidentPhone;
    if (facultyPhone !== undefined) club.facultyPhone = facultyPhone;
    if (clubEmail !== undefined) club.clubEmail = clubEmail;
    if (clubPhone !== undefined) club.clubPhone = clubPhone;
    if (instagram !== undefined) club.instagram = instagram;
    if (linkedin !== undefined) club.linkedin = linkedin;
    if (github !== undefined) club.github = github;
    if (website !== undefined) club.website = website;
    if (establishedYear !== undefined) club.establishedYear = establishedYear;
    if (memberCount !== undefined) club.memberCount = memberCount;
    if (achievementsCount !== undefined) club.achievementsCount = achievementsCount;
    if (upcomingEventsCount !== undefined) club.upcomingEventsCount = upcomingEventsCount;
    if (banner_url !== undefined) club.banner_url = banner_url;
    if (gallery !== undefined) club.gallery = gallery;

    await club.save();
    res.json(club);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/clubs/:id/status  (admin only)
router.put('/:id/status', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    club.status = req.body.status;
    if (req.body.rejection_reason !== undefined) {
      club.rejection_reason = req.body.rejection_reason;
    }
    await club.save();
    res.json(club);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/clubs/owner/:userId
router.get('/owner/:userId', requireAuth, async (req, res) => {
  try {
    if (req.params.userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const club = await Club.findOne({ owner_id: req.params.userId });
    res.json(club);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
