import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService, User, UserProfile } from '@/services/auth.service';

// ── Role types ────────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'employer' | 'guest';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  userRole: UserRole;
  signUp: (data: any) => Promise<any>;
  signIn: (data: any) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
  isAuthenticated: boolean;
  isEmployer: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Derive role from user metadata or localStorage ────────────────────────
  const getUserRole = (u: User | null): UserRole => {
    if (!u) return 'guest';
    // Check user_metadata.role (set at signup)
    const metaRole = (u as any)?.user_metadata?.role;
    if (metaRole === 'employer') return 'employer';
    if (metaRole === 'user') return 'user';
    // Fallback: check localStorage (for demo mode)
    const stored = localStorage.getItem('demo_role');
    if (stored === 'employer') return 'employer';
    return 'user';
  };

  const userRole: UserRole = getUserRole(user);

  useEffect(() => {
    // Get initial session
    initializeAuth();

    // Listen for auth changes with error handling
    try {
      const { data: { subscription } } = AuthService.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id);
          
          try {
            if (session?.user) {
              setUser(session.user as User);
              await loadUserProfile(session.user.id);
            } else {
              setUser(null);
              setProfile(null);
            }
          } catch (error) {
            console.error('Error handling auth state change:', error);
            // Don't crash the app, just log the error
          }
          
          setLoading(false);
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setLoading(false);
    }
  }, []);

  const initializeAuth = async () => {
    try {
      const session = await AuthService.getCurrentSession();
      
      if (session?.user) {
        setUser(session.user as User);
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Initialize auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const userProfile = await AuthService.getUserProfile(userId);
      setProfile(userProfile);
    } catch (error) {
      console.error('Load user profile error:', error);
    }
  };

  const signUp = async (data: any) => {
    console.log('[AuthContext] signUp called with:', { email: data.email, full_name: data.full_name });
    
    try {
      const result = await AuthService.signUp(data);
      console.log('[AuthContext] signUp result:', result);
      
      if (result.user) {
        setUser(result.user);
        // Only load profile if session exists (user is logged in)
        if (result.session) {
          await loadUserProfile(result.user.id);
        }
      }
      
      return result;
    } catch (error) {
      console.error('[AuthContext] Sign up error:', error);
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Sign up failed'
      };
    }
  };

  const signIn = async (data: any) => {
    setLoading(true);
    try {
      const result = await AuthService.signIn(data);
      
      if (result.user) {
        setUser(result.user);
        await loadUserProfile(result.user.id);
      }
      
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return null;
    
    try {
      const updatedProfile = await AuthService.updateUserProfile(user.id, updates);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
      return updatedProfile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    userRole,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    isEmployer: userRole === 'employer',
    isUser: userRole === 'user' || userRole === 'guest',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}