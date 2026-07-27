import { Router } from 'express';
import Application from '../models/Application.js';
import Registration from '../models/Registration.js';
import Opening from '../models/Opening.js';
import Event from '../models/Event.js';
import Club from '../models/Club.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// POST /api/applications
router.post('/', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const { opening_id, cover_note, full_name, roll_number, year, department_name, contact_number } = req.body;
    if (!opening_id || !full_name || !roll_number || !year || !department_name || !contact_number) {
      return res.status(400).json({ message: 'All form fields are required' });
    }
    if (!/^\d{10}$/.test(contact_number.trim())) {
      return res.status(400).json({ message: 'Contact number must be exactly 10 digits' });
    }

    const existing = await Application.findOne({ opening_id, student_id: req.user._id });
    if (existing) {
      return res.status(409).json({ message: 'You have already applied to this opening' });
    }

    const application = await Application.create({
      opening_id,
      student_id: req.user._id,
      cover_note: cover_note || '',
      full_name: full_name.trim(),
      roll_number: roll_number.trim(),
      year: year.trim(),
      department_name: department_name.trim(),
      contact_number: contact_number.trim(),
    });
    res.status(201).json(application);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already applied to this opening' });
    }
    res.status(500).json({ message: err.message });
  }
});

// GET /api/applications/student/:studentId
router.get('/student/:studentId', requireAuth, async (req, res) => {
  try {
    if (req.params.studentId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const applications = await Application.find({ student_id: req.params.studentId })
      .populate({
        path: 'opening_id',
        populate: { path: 'club_id', select: 'name' },
      })
      .sort({ applied_at: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/registrations
router.post('/registrations', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const { event_id } = req.body;
    const existing = await Registration.findOne({ event_id, student_id: req.user._id });
    if (existing) {
      return res.status(409).json({ message: 'You have already registered for this event' });
    }
    const registration = await Registration.create({
      event_id,
      student_id: req.user._id,
    });
    res.status(201).json(registration);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already registered for this event' });
    }
    res.status(500).json({ message: err.message });
  }
});

// GET /api/registrations/student/:studentId
router.get('/registrations/student/:studentId', requireAuth, async (req, res) => {
  try {
    if (req.params.studentId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const registrations = await Registration.find({ student_id: req.params.studentId })
      .populate({
        path: 'event_id',
        populate: { path: 'club_id', select: 'name' },
      })
      .sort({ registered_at: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
