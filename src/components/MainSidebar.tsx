import React, { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Upload, 
  BookOpen, 
  FileEdit, 
  Users, 
  BarChart, 
  Settings, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Edit,
  ShoppingBag,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  to, 
  icon, 
  label, 
  isCollapsed, 
  isActive 
}) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 ease-in-out",
        isActive 
          ? "bg-sidebar-primary text-sidebar-primary-foreground" 
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <span className="text-lg">{icon}</span>
      <span className={cn("transition-all duration-300", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>
        {label}
      </span>
    </Link>
  );
};

const getRoleSpecificLinks = (role: UserRole, pathname: string) => {
  const baseLinks = [
    {
      to: "/",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      isActive: pathname === "/",
      forRoles: ["writer", "editor", "publisher"] as UserRole[]
    }
  ];

  const writerLinks = [
    {
      to: "/upload",
      icon: <Upload size={20} />,
      label: "Upload Script",
      isActive: pathname === "/upload",
      forRoles: ["writer"] as UserRole[]
    },
    {
      to: "/my-scripts",
      icon: <BookOpen size={20} />,
      label: "My Scripts",
      isActive: pathname === "/my-scripts",
      forRoles: ["writer"] as UserRole[]
    },
    {
      to: "/messages",
      icon: <MessageSquare size={20} />,
      label: "Messages",
      isActive: pathname === "/messages",
      forRoles: ["writer", "editor"] as UserRole[]
    },
    {
      to: "/marketplace",
      icon: <ShoppingBag size={20} />,
      label: "Marketplace",
      isActive: pathname === "/marketplace",
      forRoles: ["writer"] as UserRole[]
    },
  ];

  const editorLinks = [
    {
      to: "/assignments",
      icon: <FileEdit size={20} />,
      label: "Assignments",
      isActive: pathname === "/assignments",
      forRoles: ["editor"] as UserRole[]
    },
    {
      to: "/live-edits",
      icon: <Edit size={20} />,
      label: "Live Edits",
      isActive: pathname === "/live-edits",
      forRoles: ["editor"] as UserRole[]
    },
    {
      to: "/messages",
      icon: <MessageSquare size={20} />,
      label: "Messages",
      isActive: pathname === "/messages",
      forRoles: ["editor"] as UserRole[]
    },
    {
      to: "/marketplace",
      icon: <ShoppingBag size={20} />,
      label: "Marketplace",
      isActive: pathname === "/marketplace",
      forRoles: ["editor"] as UserRole[]
    },
  ];

  const publisherLinks = [
    {
      to: "/manuscripts",
      icon: <BookOpen size={20} />,
      label: "Manuscripts",
      isActive: pathname === "/manuscripts",
      forRoles: ["publisher"] as UserRole[]
    },
    {
      to: "/marketplace",
      icon: <ShoppingBag size={20} />,
      label: "Marketplace",
      isActive: pathname === "/marketplace",
      forRoles: ["publisher"] as UserRole[]
    },
  ];

  const commonLinks = [
    {
      to: "/payments",
      icon: <CreditCard size={20} />,
      label: "Payments",
      isActive: pathname === "/payments",
      forRoles: ["writer", "editor", "publisher"] as UserRole[]
    },
    {
      to: "/settings",
      icon: <Settings size={20} />,
      label: "Settings",
      isActive: pathname === "/settings",
      forRoles: ["writer", "editor", "publisher"] as UserRole[]
    }
  ];

  const allLinks = [...baseLinks, ...writerLinks, ...editorLinks, ...publisherLinks, ...commonLinks];
  return allLinks.filter((link) => link.forRoles.includes(role));
};

const MainSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  if (!user) return null;

  const links = getRoleSpecificLinks(user.role, location.pathname);
  
  const roleColor = {
    writer: "bg-writer-primary",
    editor: "bg-editor-primary",
    publisher: "bg-admin-primary"
  }[user.role];

  return (
    <aside 
      className={cn(
        "flex flex-col h-screen bg-sidebar sticky top-0 border-r transition-all duration-300",
        isCollapsed ? "w-[80px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center justify-between py-4 px-4">
        <Link to="/" className={cn("flex items-center", isCollapsed && "justify-center")}>
          {!isCollapsed && (
            <h1 className="text-xl font-playfair font-bold text-[#c42127]">Mystery Publishers</h1>
          )}
          {isCollapsed && (
            <h1 className="text-xl font-playfair font-bold text-[#c42127]">MP</h1>
          )}
        </Link>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-8 w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <div className={cn("flex items-center gap-3 py-4 px-4 border-t border-b border-sidebar-border",
        isCollapsed && "justify-center"
      )}>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center overflow-hidden",
          roleColor
        )}>
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <span className="text-white font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/70 truncate capitalize">
              {user.role}
              {user.balance !== undefined && (
                <> • ${user.balance.toFixed(2)}</>
              )}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <SidebarLink
                to={link.to}
                icon={link.icon}
                label={link.label}
                isCollapsed={isCollapsed}
                isActive={link.isActive}
              />
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="py-4 px-3 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-300 ease-in-out"
        >
          <LogOut size={20} />
          <span className={cn(isCollapsed ? "opacity-0 w-0" : "opacity-100")}>
            Log Out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default MainSidebar;
