
import React from "react";
import MainSidebar from "./MainSidebar";
import { cn } from "@/lib/utils";
import { UserRole } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: UserRole;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role = "writer" }) => {
  return (
    <div className={cn(
      "flex min-h-screen",
      role === "writer" && "writer-gradient",
      role === "editor" && "editor-gradient",
      role === "publisher" && "publisher-gradient"
    )}>
      <MainSidebar />
      <main className="flex-1 p-6 overflow-auto font-inter">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
