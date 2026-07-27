import { Router } from 'express';
import Profile from '../models/Profile.js';
import Club from '../models/Club.js';
import Opening from '../models/Opening.js';
import Event from '../models/Event.js';
import Application from '../models/Application.js';
import Registration from '../models/Registration.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/admin/stats
router.get('/stats', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const [
      totalClubs,
      pendingClubs,
      approvedClubs,
      totalStudents,
      totalOwners,
      totalOpenings,
      totalEvents,
      totalApplications,
      totalRegistrations,
    ] = await Promise.all([
      Club.countDocuments(),
      Club.countDocuments({ status: 'pending' }),
      Club.countDocuments({ status: 'approved' }),
      Profile.countDocuments({ role: 'student' }),
      Profile.countDocuments({ role: 'clubOwner' }),
      Opening.countDocuments(),
      Event.countDocuments(),
      Application.countDocuments(),
      Registration.countDocuments(),
    ]);

    res.json({
      totalClubs,
      pendingClubs,
      approvedClubs,
      totalStudents,
      totalOwners,
      totalOpenings,
      totalEvents,
      totalApplications,
      totalRegistrations,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/top-openings
router.get('/top-openings', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const applications = await Application.find()
      .populate({ path: 'opening_id', populate: { path: 'club_id', select: 'name' } })
      .limit(200);
    const counts = {};
    for (const app of applications) {
      const oid = app.opening_id?._id?.toString();
      if (!oid) continue;
      if (!counts[oid]) {
        counts[oid] = {
          opening_id: oid,
          title: app.opening_id.title,
          club_name: app.opening_id.club_id?.name || 'Unknown',
          count: 0,
        };
      }
      counts[oid].count++;
    }
    const top = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
    res.json(top);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/top-events
router.get('/top-events', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate({ path: 'event_id', populate: { path: 'club_id', select: 'name' } })
      .limit(200);
    const counts = {};
    for (const reg of registrations) {
      const eid = reg.event_id?._id?.toString();
      if (!eid) continue;
      if (!counts[eid]) {
        counts[eid] = {
          event_id: eid,
          title: reg.event_id.title,
          club_name: reg.event_id.club_id?.name || 'Unknown',
          count: 0,
        };
      }
      counts[eid].count++;
    }
    const top = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
    res.json(top);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/recent-clubs
router.get('/recent-clubs', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const clubs = await Club.find().sort({ created_at: -1 }).limit(5);
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/pending-clubs
router.get('/pending-clubs', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const clubs = await Club.find({ status: 'pending' })
      .populate({ path: 'owner_id', select: '-password' })
      .sort({ created_at: 1 });
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const users = await Profile.find().select('-password').sort({ created_at: -1 });
    const clubs = await Club.find();
    const clubMap = {};
    for (const c of clubs) {
      clubMap[c.owner_id.toString()] = c;
    }
    res.json({ users, clubs: clubMap });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
