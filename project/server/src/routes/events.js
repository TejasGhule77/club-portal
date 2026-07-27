import { Router } from 'express';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import Club from '../models/Club.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

// GET /api/clubs/:clubId/events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ club_id: req.params.clubId }).sort({ date: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/clubs/:clubId/events
router.post('/', requireAuth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    if (club.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const event = await Event.create({
      ...req.body,
      club_id: req.params.clubId,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/events/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const club = await Club.findById(event.club_id);
    if (!club || club.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { title, description, date, venue, poster_url } = req.body;
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (date !== undefined) event.date = date;
    if (venue !== undefined) event.venue = venue;
    if (poster_url !== undefined) event.poster_url = poster_url;
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const club = await Club.findById(event.club_id);
    if (!club || club.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await event.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/events/:id/registrations
router.get('/:id/registrations', requireAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const club = await Club.findById(event.club_id);
    if (!club || club.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const registrations = await Registration.find({ event_id: req.params.id })
      .populate('student_id', '-password')
      .sort({ registered_at: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/registrations/:regId/status
router.put('/registrations/:regId/status', requireAuth, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.regId);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });
    const event = await Event.findById(registration.event_id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const club = await Club.findById(event.club_id);
    if (!club || club.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    registration.status = req.body.status;
    await registration.save();
    res.json(registration);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
