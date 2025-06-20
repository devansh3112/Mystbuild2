import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Session } from "@supabase/supabase-js";

export type UserRole = "writer" | "editor" | "publisher";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  balance?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUserBalance: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile data
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, avatar_url, balance')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, it might be a newly verified user
        if (error.code === 'PGRST116') {
          console.log('Profile not found for user:', userId);
          return null;
        }
        console.error('Error fetching profile:', error);
        return null;
      }

      if (!data) return null;

      console.log('Profile fetched successfully:', data);
      return {
        id: data.id,
        name: data.name,
        email: session?.user.email || '',
        role: data.role,
        avatar: data.avatar_url,
        balance: data.balance || 0
      };
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  };

  // Function to create profile for verified users
  const createProfileForVerifiedUser = async (userId: string, email: string) => {
    try {
      // Get user metadata to retrieve the role they selected at signup
      const { data: userData, error: userError } = await supabase.auth.getUser();
      let selectedRole: UserRole = 'writer'; // fallback default
      
      if (userData?.user?.user_metadata?.role) {
        selectedRole = userData.user.user_metadata.role as UserRole;
      }

      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            name: email.split('@')[0], // Use email prefix as default name
            role: selectedRole, // Use the role from metadata
            avatar_url: `https://i.pravatar.cc/150?u=${email}`,
            balance: 0
          }
        ]);

      // Handle conflicts (profile already exists) - this is not an error
      if (error && error.code === '23505') {
        console.log('Profile already exists for user:', userId);
        return await fetchUserProfile(userId);
      }

      if (error) {
        console.error('Error creating profile for verified user:', error);
        return null;
      }

      return await fetchUserProfile(userId);
    } catch (error) {
      console.error('Profile creation error:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        // If there's a session error (like invalid refresh token), sign out
        if (sessionError) {
          console.log('Session error, signing out:', sessionError);
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        setSession(sessionData.session);
        
        // If we have a session, fetch the user profile
        if (sessionData.session?.user.id) {
          const profile = await fetchUserProfile(sessionData.session.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear any stale auth state
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
      
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('Auth state change:', event);
          setSession(newSession);
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (newSession?.user.id) {
              let profile = await fetchUserProfile(newSession.user.id);
              
              // If no profile exists (newly verified user), create one
              if (!profile && newSession.user.email) {
                profile = await createProfileForVerifiedUser(newSession.user.id, newSession.user.email);
              }
              
              setUser(profile);
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );

      // Cleanup subscription
      return () => {
        subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check if email is verified
      if (data.user && !data.user.email_confirmed_at) {
        throw new Error("Email not verified. Please check your email and click the verification link before signing in.");
      }
      
      // Auth state change listener will handle updating the user
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole = "writer"): Promise<void> => {
    try {
      // 1. Create the auth user with role stored in metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role
          }
        }
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("User creation failed");
      }

      // Check if email confirmation is required
      if (!data.session) {
        // Email confirmation is required - don't create profile yet
        // The role is now stored in user metadata and will be used later
        throw new Error("VERIFICATION_REQUIRED");
      }

      // 2. Create the user profile (only if email confirmation is not required)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            name,
            role,
            avatar_url: `https://i.pravatar.cc/150?u=${email}`,
            balance: 0
          }
        ]);

      // Handle conflicts (profile already exists) - this is not an error
      if (profileError && profileError.code === '23505') {
        console.log('Profile already exists for user:', data.user.id);
      } else if (profileError) {
        console.error('Error creating profile:', profileError);
        // If profile creation fails, we should try to delete the auth user
        // but continue since the auth signup succeeded
      }

      // Auth state change listener will handle updating the user
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUserBalance = async (amount: number) => {
    if (!user) return;
    
    const newBalance = (user.balance || 0) + amount;
    
    // Update the user in the local state
      setUser({
        ...user,
      balance: newBalance
    });
    
    // Update the balance in the database if we're using a real user
    if (session) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', user.id);
          
        if (error) {
          console.error('Error updating balance:', error);
        }
      } catch (error) {
        console.error('Balance update error:', error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
        updateUserBalance
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Use named export to fix hot reload issues
function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { useAuth };
