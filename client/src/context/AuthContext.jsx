import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved session or demo login
    const savedToken = localStorage.getItem('urbanlogix_token');
    const savedRole = localStorage.getItem('urbanlogix_role') || 'admin';
    const savedName = localStorage.getItem('urbanlogix_name') || 'Elena Vance';

    if (savedToken) {
      setUser({ id: '00000000-0000-0000-0000-000000000001', email: 'dispatcher@urbanlogix.eco' });
      setProfile({
        full_name: savedName,
        role: savedRole,
        organization: 'Metro Green Logistics Co.',
      });
      setLoading(false);
      return;
    }

    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
          fetchProfile(session.user.id, session.access_token);
        } else {
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setUser(session.user);
          localStorage.setItem('urbanlogix_token', session.access_token);
          fetchProfile(session.user.id, session.access_token);
        } else {
          setUser(null);
          setProfile(null);
          localStorage.removeItem('urbanlogix_token');
          setLoading(false);
        }
      });

      return () => subscription?.unsubscribe();
    } else {
      // Auto-initialize demo mode user by default so user can test right away
      loginDemo('admin');
      setLoading(false);
    }
  }, []);

  async function fetchProfile(userId, token) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
        localStorage.setItem('urbanlogix_role', data.role);
        localStorage.setItem('urbanlogix_name', data.full_name);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  const loginDemo = (role = 'admin') => {
    const roleNames = {
      admin: 'Elena Vance (Chief Operations)',
      dispatcher: 'Marcus Kane (Lead Dispatcher)',
      rider: 'Chloe Rivera (Fleet Courier)',
    };
    const token = `demo-${role}-token`;
    localStorage.setItem('urbanlogix_token', token);
    localStorage.setItem('urbanlogix_role', role);
    localStorage.setItem('urbanlogix_name', roleNames[role]);

    setUser({
      id: '00000000-0000-0000-0000-000000000001',
      email: `${role}@urbanlogix.eco`,
    });
    setProfile({
      full_name: roleNames[role],
      role,
      organization: 'Metro Green Logistics Co.',
    });
  };

  const login = async (email, password) => {
    if (!isSupabaseConfigured()) {
      loginDemo('admin');
      return { success: true };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      localStorage.setItem('urbanlogix_token', data.session.access_token);
    }
    return data;
  };

  const register = async (email, password, fullName, role = 'dispatcher') => {
    if (!isSupabaseConfigured()) {
      loginDemo(role);
      return { success: true };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    localStorage.removeItem('urbanlogix_token');
    localStorage.removeItem('urbanlogix_role');
    localStorage.removeItem('urbanlogix_name');
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        loginDemo,
        isAdmin: profile?.role === 'admin',
        isDispatcher: profile?.role === 'dispatcher' || profile?.role === 'admin',
        isRider: profile?.role === 'rider',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
