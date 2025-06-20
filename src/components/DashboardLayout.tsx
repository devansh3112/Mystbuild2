import React from "react";
import { Navigate } from "react-router-dom";
import MainSidebar from "./MainSidebar";
import { cn } from "@/lib/utils";
import { UserRole, useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: UserRole;
  allowedRoles?: UserRole[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  role = "writer", 
  allowedRoles 
}) => {
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has permission to access this page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user's role
    switch (user.role) {
      case 'writer':
        return <Navigate to="/dashboard" replace />;
      case 'editor':
        return <Navigate to="/editor-dashboard" replace />;
      case 'publisher':
        return <Navigate to="/admin-dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  // Use the user's actual role instead of the prop
  const currentRole = user.role || role;

  return (
    <div className={cn(
      "flex min-h-screen",
      currentRole === "writer" && "writer-gradient",
      currentRole === "editor" && "editor-gradient",
      currentRole === "publisher" && "publisher-gradient"
    )}>
      <MainSidebar />
      <main className="flex-1 p-6 overflow-auto font-inter">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
