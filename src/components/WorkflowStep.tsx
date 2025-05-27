
import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollReveal } from './ui/scroll-reveal';

interface WorkflowStepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive?: boolean;
  delay?: number;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({
  number,
  title,
  description,
  icon,
  isActive = false,
  delay = 0,
}) => {
  return (
    <ScrollReveal 
      animation="slide-up" 
      delay={delay}
      className="relative"
    >
      <div
        className={cn(
          "p-6 rounded-lg border transition-all duration-300 h-full",
          "hover:shadow-lg hover:-translate-y-1",
          isActive 
            ? "border-primary/40 bg-primary/5" 
            : "border-border bg-white"
        )}
      >
        <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md">
          {number}
        </div>
        <div className="mb-4 text-primary">{icon}</div>
        <h3 className="text-xl font-playfair font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </ScrollReveal>
  );
};

export default WorkflowStep;
