
import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollReveal } from './ui/scroll-reveal';

interface RoleCardProps {
  icon: React.ReactNode;
  role: string;
  actions: string[];
  color: 'writer' | 'editor' | 'admin';
  delay?: number;
}

const RoleCard: React.FC<RoleCardProps> = ({
  icon,
  role,
  actions,
  color,
  delay = 0
}) => {
  return (
    <ScrollReveal 
      animation="fade-in" 
      delay={delay}
      className="h-full"
    >
      <div className={cn(
        "p-6 rounded-lg border transition-all duration-300 h-full",
        "hover:shadow-lg group",
        color === 'writer' ? "writer-gradient" : 
        color === 'editor' ? "editor-gradient" : "admin-gradient"
      )}>
        <div className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center mb-4",
          "group-hover:scale-110 transition-all duration-300",
          color === 'writer' ? "bg-writer-primary text-white" : 
          color === 'editor' ? "bg-editor-primary text-white" : "bg-admin-primary text-white"
        )}>
          {icon}
        </div>

        <h3 className={cn(
          "text-xl font-playfair font-semibold mb-3",
          color === 'writer' ? "text-writer-primary" : 
          color === 'editor' ? "text-editor-primary" : "text-admin-primary"
        )}>
          {role}
        </h3>

        <ul className="space-y-2">
          {actions.map((action, index) => (
            <li key={index} className="flex items-center">
              <span className={cn(
                "mr-2 text-lg",
                color === 'writer' ? "text-writer-accent" : 
                color === 'editor' ? "text-editor-accent" : "text-admin-accent"
              )}>
                ✓
              </span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </ScrollReveal>
  );
};

export default RoleCard;
