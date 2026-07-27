import { Router } from 'express';
import Achievement from '../models/Achievement.js';
import Club from '../models/Club.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

// GET /api/clubs/:clubId/achievements
router.get('/', async (req, res) => {
  try {
    const achievements = await Achievement.find({ club_id: req.params.clubId }).sort({ date: -1 });
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/clubs/:clubId/achievements
router.post('/', requireAuth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    if (club.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const achievement = await Achievement.create({
      ...req.body,
      club_id: req.params.clubId,
    });
    res.status(201).json(achievement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/achievements/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) return res.status(404).json({ message: 'Achievement not found' });
    const club = await Club.findById(achievement.club_id);
    if (!club || club.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await achievement.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
