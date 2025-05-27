
import React from 'react';
import { ScrollReveal } from './ui/scroll-reveal';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  delay = 0
}) => {
  return (
    <ScrollReveal 
      animation="zoom-in" 
      delay={delay}
      className="group"
    >
      <div className="p-6 rounded-xl border border-border bg-white/50 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md h-full">
        <div className="mb-4 text-primary text-2xl p-3 bg-primary/10 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-playfair font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </ScrollReveal>
  );
};

export default FeatureCard;
