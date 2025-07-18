import { useState, useEffect, useCallback } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          },
          emailRedirectTo: undefined, // Don't redirect after email confirmation
        },
      });

      if (error) {
        console.error('Auth signup error:', error);
        return { data, error };
      }

      // If user was created but profile creation failed in trigger, create it manually
      if (data.user) {
        // Wait a moment for the trigger to execute
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if profile was created by the trigger
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          // Profile doesn't exist, create it manually as fallback
          console.log('Profile not created by trigger, creating manually...');
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              username: username || data.user.email?.split('@')[0] || 'user',
              level: 1,
              total_xp: 0,
              current_streak: 0,
              longest_streak: 0,
              avatar_color: 'purple',
            });

          if (profileError) {
            console.error('Manual profile creation error:', profileError);
            // Don't fail signup if profile creation fails - it can be created later
          } else {
            console.log('Profile created manually successfully');
          }
        }
      }

      return { data, error };
    } catch (error) {
      console.error('Signup exception:', error);
      return {
        data: null,
        error: {
          message: `Signup failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { data, error };
      }

      // Check if profile exists and create if needed
      if (data.user) {
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log('Profile not found after login, creating...');
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              username:
                data.user.user_metadata?.username || email.split('@')[0],
              level: 1,
              total_xp: 0,
              current_streak: 0,
              longest_streak: 0,
              avatar_color: 'purple',
            });

          if (profileError) {
            console.error('Profile creation error on login:', profileError);
          } else {
            console.log('Profile created successfully on login');
          }
        }
      }

      return { data, error };
    } catch (error) {
      console.error('Login exception:', error);
      return {
        data: null,
        error: {
          message: `Login failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Use deep linking for React Native
          redirectTo: 'exp://localhost:8081/--/auth/callback',
        },
      });

      return { data, error };
    } catch (error) {
      console.error('Google sign-in exception:', error);
      return {
        data: null,
        error: {
          message: `Google sign-in failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }

    return { data, error };
  };

  const loadOnboardingData = useCallback(async () => {
    if (!user) return { data: null, error: new Error('No user logged in') };

    try {
      // Use order by to get the most recent entry and limit to 1
      // This handles cases where there might be duplicate entries
      const { data, error } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle instead of single to handle no rows gracefully

      return { data, error };
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      return { data: null, error };
    }
  }, [user]);

  const hasCompletedOnboarding = useCallback(async () => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('onboarding_data')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      return !error && data !== null;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }, [user]);

  return {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    loadProfile,
    loadOnboardingData,
    hasCompletedOnboarding,
  };
}
