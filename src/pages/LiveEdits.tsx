
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileEdit, Calendar, Clock, BookOpen } from "lucide-react";

// Sample data for live edits
const liveEditsData = [
  {
    id: "m1",
    title: "The Lost Chapter",
    author: "Sarah Johnson",
    deadline: "May 28, 2025",
    coverImage: "https://i.pravatar.cc/150?img=32", // Placeholder image
    chapters: [
      { number: 1, title: "The Beginning", status: "Completed", progress: 100, lastEdited: "2 days ago" },
      { number: 2, title: "The Mystery Unfolds", status: "In Progress", progress: 65, lastEdited: "Yesterday" },
      { number: 3, title: "Clues and Revelations", status: "Not Started", progress: 0, lastEdited: null }
    ]
  },
  {
    id: "m2",
    title: "Beyond the Stars",
    author: "Michael Chen",
    deadline: "June 15, 2025",
    coverImage: "https://i.pravatar.cc/150?img=11", // Placeholder image
    chapters: [
      { number: 1, title: "New Horizons", status: "Not Started", progress: 0, lastEdited: null },
      { number: 2, title: "The Discovery", status: "Not Started", progress: 0, lastEdited: null }
    ]
  }
];

const LiveEdits: React.FC = () => {
  const { user } = useAuth();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{status}</Badge>;
      case "In Progress":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">{status}</Badge>;
      case "Not Started":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout role="editor">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold font-playfair">Live Edits</h1>
          <p className="text-muted-foreground mt-1">Edit manuscripts in real-time and track your progress</p>
        </div>

        <div className="space-y-8">
          {liveEditsData.map((manuscript) => (
            <Card key={manuscript.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex flex-wrap md:flex-nowrap gap-4">
                  <div className="w-24 h-32 bg-muted rounded-md overflow-hidden shrink-0">
                    <img 
                      src={manuscript.coverImage} 
                      alt={`Cover for ${manuscript.title}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <CardTitle className="font-playfair">{manuscript.title}</CardTitle>
                    <CardDescription>
                      <span className="block">By {manuscript.author}</span>
                      <span className="flex items-center gap-1 mt-1">
                        <Calendar size={14} className="text-muted-foreground" />
                        <span>Due: {manuscript.deadline}</span>
                      </span>
                      <span className="flex items-center gap-1 mt-1">
                        <BookOpen size={14} className="text-muted-foreground" />
                        <span>{manuscript.chapters.length} chapters</span>
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <h4 className="font-medium">Chapters</h4>
                  
                  <div className="space-y-3">
                    {manuscript.chapters.map((chapter) => (
                      <div key={chapter.number} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                          <div>
                            <h5 className="font-medium">Chapter {chapter.number}: {chapter.title}</h5>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              {chapter.lastEdited ? (
                                <>
                                  <Clock size={14} />
                                  <span>Last edited {chapter.lastEdited}</span>
                                </>
                              ) : (
                                <span>Not started yet</span>
                              )}
                            </div>
                          </div>
                          <div>
                            {getStatusBadge(chapter.status)}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{chapter.progress}%</span>
                          </div>
                          <Progress value={chapter.progress} className="h-2" />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button className="bg-editor-primary hover:bg-editor-accent gap-2">
                            <FileEdit size={16} />
                            <span>Edit Now</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveEdits;
