import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: Partial<User>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ التحقق من الأدمن عن طريق الإيميل
  const isAdmin = user?.email === 'tarekmk78@gmail.com';

  const fetchUserProfile = async (userId: string) => {
    console.log('[AUTH DEBUG] fetchUserProfile starting for userId:', userId);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (!currentSession?.access_token) {
        console.error('[AUTH DEBUG] No access token available');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // ✅ الفرق المهم: نتأكد إن السبب هو "مفيش صف أصلاً" (PGRST116)
      // مش أي خطأ تاني زي مشكلة توكن أو اتصال
      if (error && error.code === 'PGRST116') {
        console.log('[AUTH DEBUG] No profile found, creating new profile for user...');

        const profileData: any = {
          id: userId,
          name: currentSession.user.user_metadata?.name ||
                currentSession.user.user_metadata?.full_name ||
                currentSession.user.email?.split('@')[0] || 'User',
          email: currentSession.user.email,
        };

        if (currentSession.user.user_metadata?.phone) {
          profileData.phone = currentSession.user.user_metadata.phone;
        }

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (insertError) {
          console.error('[AUTH DEBUG] Failed to create profile:', insertError);
        } else {
          setUser(newProfile as User);
          console.log('[AUTH DEBUG] New profile created successfully:', newProfile);
        }
        setLoading(false);
        return;
      }

      // ✅ أي خطأ تاني (مش "مفيش صف") بنوقفه هنا وميحصلش محاولة إنشاء بروفايل جديد
      if (error) {
        console.error('[AUTH DEBUG] fetchUserProfile error (not creating new profile):', error);
        setLoading(false);
        return;
      }

      if (data) {
        setUser(data as User);
        console.log('[AUTH DEBUG] Profile loaded successfully:', data);
      }
      setLoading(false);
    } catch (err) {
      console.error('[AUTH DEBUG] fetchUserProfile FAILED:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('[AUTH DEBUG] onAuthStateChange fired:', event, newSession?.user?.email);

      if (event === 'SIGNED_IN' && newSession) {
        setSession(newSession);
        setLoading(false);
        fetchUserProfile(newSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        setSession(newSession);
      } else {
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log('[AUTH DEBUG] getSession result:', currentSession?.user?.email);

      if (currentSession) {
        setSession(currentSession);
        fetchUserProfile(currentSession.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: fullName,
            phone: phone,
          },
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (!error) {
        setUser({ ...user, ...data });
      }
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
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