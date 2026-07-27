import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Profile from '../models/Profile.js';
import Club from '../models/Club.js';

dotenv.config();

async function seed() {
  try {
    let mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not set. Provide a valid MongoDB connection string in the server environment (.env).');
    }
    // Clean MONGODB_URI to correct schema typos and strip brackets around passwords
    if (mongoUri.startsWith('mmongodb')) {
      mongoUri = mongoUri.replace(/^mmongodb/, 'mongodb');
    }
    mongoUri = mongoUri.replace(/:<([^>]+)>/, ':$1');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');


    await Profile.deleteMany({});
    await Club.deleteMany({});
    console.log('Cleared existing data');

    const student = await Profile.create({
      name: 'Alice Student',
      email: 'student@college.edu',
      password: await bcrypt.hash('Student123!', 10),
      role: 'student',
      college_id: 'CS2021001',
      branch: 'Computer Science',
      year: '2nd Year',
    });
    console.log('Created student:', student.email);

    const owner = await Profile.create({
      name: 'Bob ClubOwner',
      email: 'owner@college.edu',
      password: await bcrypt.hash('Owner123!', 10),
      role: 'clubOwner',
    });
    console.log('Created club owner:', owner.email);

    const admin = await Profile.create({
      name: 'Admin User',
      email: 'admin@college.edu',
      password: await bcrypt.hash('Admin123!', 10),
      role: 'admin',
    });
    console.log('Created admin:', admin.email);

    const club = await Club.create({
      name: 'CodeCrafters',
      description: 'A technical club for coding enthusiasts. We host hackathons, coding competitions, and tech talks.',
      logo_url: '',
      category: 'technical',
      faculty_advisor: 'Dr. Sarah Mitchell',
      owner_id: owner._id,
      status: 'approved',
    });
    console.log('Created club:', club.name);

    console.log('\n========================================');
    console.log('  SEED COMPLETE - Login Credentials');
    console.log('========================================');
    console.log('  Student:    student@college.edu  / Student123!');
    console.log('  Club Owner: owner@college.edu    / Owner123!');
    console.log('  Admin:      admin@college.edu   / Admin123!');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
