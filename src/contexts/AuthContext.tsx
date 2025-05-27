
import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "writer" | "editor" | "publisher";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  balance?: number; // User's current balance
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  setDemoUser: (role: UserRole) => void;
  updateUserBalance: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample users for demo purposes
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

  const login = async (email: string, password: string): Promise<void> => {
    // This would be replaced by actual authentication logic
    console.log("Login attempt with", email, password);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // For demo, set as writer
    setUser(demoUsers.writer);
  };

  const signup = async (name: string, email: string, password: string, role: UserRole = "writer"): Promise<void> => {
    // This would be replaced by actual signup logic
    console.log("Signup attempt with", { name, email, password, role });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Create a new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      avatar: `https://i.pravatar.cc/150?u=${email}`, // Generate placeholder avatar
      balance: 0.00 // New users start with zero balance
    };
    
    // For demo, log in the user automatically after signup
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };
  
  const setDemoUser = (role: UserRole) => {
    setUser(demoUsers[role]);
  };

  const updateUserBalance = (amount: number) => {
    if (user) {
      setUser({
        ...user,
        balance: (user.balance || 0) + amount
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
