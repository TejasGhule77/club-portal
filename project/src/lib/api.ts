import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function transformId(obj: any): any {
  if (Array.isArray(obj)) return obj.map(transformId);
  if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    const { _id, ...rest } = obj;
    if (_id) rest.id = _id;
    for (const key of Object.keys(rest)) {
      rest[key] = transformId(rest[key]);
    }
    return rest;
  }
  return obj;
}

api.interceptors.response.use(
  (res) => {
    res.data = transformId(res.data);
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

export default api;

export type UserRole = 'student' | 'clubOwner' | 'admin';
export type ClubStatus = 'pending' | 'approved' | 'rejected';
export type ClubCategory = 'technical' | 'cultural' | 'sports' | 'literary' | 'social' | 'other';
export type OpeningStatus = 'open' | 'closed';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface Profile {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  college_id: string | null;
  branch: string | null;
  year: string | null;
  created_at: string;
}

export interface Club {
  id: string;
  _id?: string;
  name: string;
  description: string;
  logo_url: string;
  category: ClubCategory;
  faculty_advisor: string;
  owner_id: string;
  status: ClubStatus;
  rejection_reason: string;
  created_at: string;
  owner?: Profile;

  // New fields
  presidentName?: string;
  presidentPhoto?: string;
  presidentEmail?: string;
  presidentPhone?: string;
  facultyName?: string;
  facultyPhone?: string;
  clubEmail?: string;
  clubPhone?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  establishedYear?: number;
  memberCount?: number;
  achievementsCount?: number;
  upcomingEventsCount?: number;
  banner_url?: string;
  gallery?: string[];
}

export interface Achievement {
  id: string;
  _id?: string;
  club_id: string;
  title: string;
  description: string;
  date: string | null;
  image_url: string;
  created_at: string;
}

export interface Opening {
  id: string;
  _id?: string;
  club_id: string;
  title: string;
  description: string;
  deadline: string | null;
  status: OpeningStatus;
  created_at: string;
}

export interface Application {
  id: string;
  _id?: string;
  opening_id: string | { _id: string; title: string; club_id: { _id: string; name: string } };
  student_id: string | Profile;
  cover_note: string;
  status: ApplicationStatus;
  applied_at: string;
  student?: Profile;
  opening?: Opening;
  full_name?: string;
  roll_number?: string;
  year?: string;
  department_name?: string;
  contact_number?: string;
}

export interface ClubEvent {
  id: string;
  _id?: string;
  club_id: string;
  title: string;
  description: string;
  date: string | null;
  venue: string;
  poster_url: string;
  created_at: string;
}

export interface Registration {
  id: string;
  _id?: string;
  event_id: string | { _id: string; title: string; club_id: { _id: string; name: string } };
  student_id: string | Profile;
  status: ApplicationStatus;
  registered_at: string;
  student?: Profile;
  event?: ClubEvent;
}

export const CATEGORIES: { value: ClubCategory; label: string }[] = [
  { value: 'technical', label: 'Technical' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'literary', label: 'Literary' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
];

export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
export const BRANCHES = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'Chemical',
  'Aerospace',
  'Biotechnology',
  'Other',
];

export const ADMIN_INVITE_CODE = 'ADMIN-CLUB-PORTAL-2026';
