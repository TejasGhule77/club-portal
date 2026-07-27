import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api, { type Profile, type UserRole } from '../lib/api';

interface AuthContextValue {
  session: { token: string } | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (params: SignUpParams) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; profile?: Profile }>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

interface SignUpParams {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  collegeId?: string;
  branch?: string;
  year?: string;
  adminCode?: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setSession({ token });
      api
        .get('/auth/me')
        .then(({ data }) => {
          if (data.user) {
            setProfile(data.user);
          } else {
            localStorage.removeItem('token');
            setSession(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          setSession(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (params: SignUpParams) => {
    try {
      const { data } = await api.post('/auth/register', {
        email: params.email,
        password: params.password,
        name: params.name,
        role: params.role,
        college_id: params.collegeId,
        branch: params.branch,
        year: params.year,
        adminCode: params.adminCode,
      });
      localStorage.setItem('token', data.token);
      setSession({ token: data.token });
      setProfile(data.user);
      return { error: null };
    } catch (err: any) {
      return { error: err.response?.data?.message || 'Registration failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setSession({ token: data.token });
      setProfile(data.user);
      return { error: null, profile: data.user };
    } catch (err: any) {
      return { error: err.response?.data?.message || 'Login failed' };
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.user) setProfile(data.user);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
