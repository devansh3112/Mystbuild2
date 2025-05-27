
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  imageUrl?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  role,
  imageUrl
}) => {
  return (
    <Card className="border border-border bg-white hover:shadow-md transition-all duration-300">
      <CardContent className="pt-6 px-6 pb-6">
        <div className="flex flex-col h-full">
          <div className="text-4xl font-playfair text-primary/30 mb-4">"</div>
          <p className="italic text-lg mb-6">{quote}</p>
          
          <div className="mt-auto flex items-center">
            <Avatar className="h-12 w-12 mr-4 border-2 border-primary/10 shadow-sm">
              {imageUrl ? (
                <AvatarImage src={imageUrl} alt={author} />
              ) : (
                <AvatarFallback className="bg-primary/5 text-primary">
                  {author.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="font-semibold">{author}</div>
              <div className="text-sm text-muted-foreground">{role}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
