
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type ChapterStatus = "Not Started" | "In Progress" | "Completed";

export interface Chapter {
  id: number;
  title: string;
  progress: number;
  status: ChapterStatus;
}

export interface ManuscriptWithChapters {
  id: number;
  title: string;
  author: string;
  authorId: string;
  deadline: string;
  priority: string;
  chapters: Chapter[];
}

interface ChapterProgressListProps {
  manuscript: ManuscriptWithChapters;
}

const ChapterProgressList: React.FC<ChapterProgressListProps> = ({ manuscript }) => {
  return (
    <Card className="mb-4">
      <CardContent className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{manuscript.title}</h3>
            <p className="text-sm text-muted-foreground">
              By {manuscript.author}
            </p>
          </div>
          <Badge variant="secondary">Priority: {manuscript.priority}</Badge>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Chapters</h4>
          <ul className="space-y-1">
            {manuscript.chapters.map((chapter) => (
              <li key={chapter.id} className="flex items-center justify-between">
                <span>{chapter.title}</span>
                <div className="flex items-center space-x-2">
                  <Progress value={chapter.progress} className="w-24 h-2" />
                  <span className="text-xs text-muted-foreground">{chapter.progress}%</span>
                  <Badge variant="secondary">{chapter.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Deadline: {manuscript.deadline}
          </p>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChapterProgressList;
