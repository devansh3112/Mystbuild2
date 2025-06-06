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
  setDemoUser: (role: UserRole) => void;
  updateUserBalance: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample users for demo purposes - keeping for backward compatibility
const demoUsers: Record<UserRole, User> = {
  writer: {
    id: "w1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "writer",
    avatar: "https://i.pravatar.cc/150?img=32",
    balance: 1250.00
  },
  editor: {
    id: "e1",
    name: "Mark Davis",
    email: "mark@example.com",
    role: "editor",
    avatar: "https://i.pravatar.cc/150?img=61",
    balance: 2450.75
  },
  publisher: {
    id: "a1",
    name: "Priya Sharma",
    email: "priya@example.com",
    role: "publisher",
    avatar: "https://i.pravatar.cc/150?img=48",
    balance: 5000.00
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile data
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        email: session?.user.email || '',
        role: data.role,
        avatar: data.avatar_url,
        balance: data.balance
      };
    } catch (error) {
      console.error('Profile fetch error:', error);
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
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);
        
        // If we have a session, fetch the user profile
        if (sessionData.session?.user.id) {
          const profile = await fetchUserProfile(sessionData.session.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
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
              const profile = await fetchUserProfile(newSession.user.id);
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      // Auth state change listener will handle updating the user
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole = "writer"): Promise<void> => {
    try {
      // 1. Create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("User creation failed");
      }

      // 2. Create the user profile
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

      if (profileError) {
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
  
  // Keep this for backward compatibility with the demo functionality
  const setDemoUser = (role: UserRole) => {
    setUser(demoUsers[role]);
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
        setDemoUser,
        updateUserBalance
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
