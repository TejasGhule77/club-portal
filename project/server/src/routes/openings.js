import { Router } from 'express';
import Opening from '../models/Opening.js';
import Application from '../models/Application.js';
import Club from '../models/Club.js';
import Profile from '../models/Profile.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

// GET /api/clubs/:clubId/openings
router.get('/', async (req, res) => {
  try {
    const openings = await Opening.find({ club_id: req.params.clubId }).sort({ created_at: -1 });
    res.json(openings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/clubs/:clubId/openings
router.post('/', requireAuth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    if (club.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const opening = await Opening.create({
      ...req.body,
      club_id: req.params.clubId,
    });
    res.status(201).json(opening);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/openings/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const opening = await Opening.findById(req.params.id);
    if (!opening) return res.status(404).json({ message: 'Opening not found' });
    const club = await Club.findById(opening.club_id);
    if (!club || club.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { title, description, deadline, status } = req.body;
    if (title !== undefined) opening.title = title;
    if (description !== undefined) opening.description = description;
    if (deadline !== undefined) opening.deadline = deadline;
    if (status !== undefined) opening.status = status;
    await opening.save();
    res.json(opening);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/openings/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const opening = await Opening.findById(req.params.id);
    if (!opening) return res.status(404).json({ message: 'Opening not found' });
    const club = await Club.findById(opening.club_id);
    if (!club || club.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await opening.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/openings/:id/applications
router.get('/:id/applications', requireAuth, async (req, res) => {
  try {
    const opening = await Opening.findById(req.params.id);
    if (!opening) return res.status(404).json({ message: 'Opening not found' });
    const club = await Club.findById(opening.club_id);
    if (!club || club.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const applications = await Application.find({ opening_id: req.params.id })
      .populate('student_id', '-password')
      .sort({ applied_at: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/applications/:id/status
router.put('/applications/:appId/status', requireAuth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.appId);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    const opening = await Opening.findById(application.opening_id);
    if (!opening) return res.status(404).json({ message: 'Opening not found' });
    const club = await Club.findById(opening.club_id);
    if (!club || club.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    application.status = req.body.status;
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
