
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileEdit, BookOpen, Users, Calendar, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data for assignments
const assignmentData = [
  {
    id: "m1",
    title: "The Lost Chapter",
    author: "Sarah Johnson",
    genre: "Mystery/Thriller",
    publisher: "Mystery Publishers",
    publisherContact: "editor@mysterypublishers.com",
    deadline: "May 28, 2025",
    status: "In Progress",
    priority: "High",
    editors: [
      { id: "e1", name: "Mark Davis", role: "Lead Editor" },
      { id: "e2", name: "Elena Kim", role: "Copy Editor" }
    ],
    chapters: [
      { number: 1, title: "The Beginning", status: "Completed", wordCount: 3500 },
      { number: 2, title: "The Mystery Unfolds", status: "In Progress", wordCount: 4200 },
      { number: 3, title: "Clues and Revelations", status: "Not Started", wordCount: 3800 }
    ]
  },
  {
    id: "m2",
    title: "Beyond the Stars",
    author: "Michael Chen",
    genre: "Science Fiction",
    publisher: "Mystery Publishers",
    publisherContact: "scifi@mysterypublishers.com",
    deadline: "June 15, 2025",
    status: "Not Started",
    priority: "Medium",
    editors: [
      { id: "e1", name: "Mark Davis", role: "Content Editor" }
    ],
    chapters: [
      { number: 1, title: "New Horizons", status: "Not Started", wordCount: 3200 },
      { number: 2, title: "The Discovery", status: "Not Started", wordCount: 3800 }
    ]
  }
];

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "High":
      return <Badge variant="destructive">{priority}</Badge>;
    case "Medium":
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">{priority}</Badge>;
    case "Low":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">{priority}</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

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

const Assignments: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout role="editor">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold font-playfair">Assignments</h1>
          <p className="text-muted-foreground mt-1">Manage your assigned manuscripts and editing tasks</p>
        </div>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="current">Current Assignments</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="current">
            <div className="space-y-6">
              {assignmentData.map((manuscript) => (
                <Card key={manuscript.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <CardTitle className="font-playfair">{manuscript.title}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        {getPriorityBadge(manuscript.priority)}
                        {getStatusBadge(manuscript.status)}
                      </div>
                    </div>
                    <CardDescription>
                      <span className="block">By {manuscript.author} • {manuscript.genre}</span>
                      <span className="flex items-center gap-1 mt-1">
                        <Calendar size={14} className="text-muted-foreground" />
                        <span>Due: {manuscript.deadline}</span>
                      </span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Publisher Information */}
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <h4 className="font-medium text-sm mb-2 uppercase text-muted-foreground">Publisher Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Publisher</p>
                          <p className="text-sm text-muted-foreground">{manuscript.publisher}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Contact</p>
                          <p className="text-sm text-muted-foreground">{manuscript.publisherContact}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Editors */}
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <Users size={16} />
                        <span>Editing Team</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {manuscript.editors.map((editor) => (
                          <div key={editor.id} className="flex items-center border rounded-full px-3 py-1 text-sm">
                            <span>{editor.name}</span>
                            <span className="mx-1 text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{editor.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Chapter List */}
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <BookOpen size={16} />
                        <span>Chapters ({manuscript.chapters.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {manuscript.chapters.map((chapter) => (
                          <div key={chapter.number} className="flex flex-wrap justify-between items-center p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div>
                              <span className="font-medium">Chapter {chapter.number}: {chapter.title}</span>
                              <div className="text-sm text-muted-foreground">
                                {chapter.wordCount} words
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(chapter.status)}
                              <button className="flex items-center gap-1 text-sm bg-editor-primary text-white px-3 py-1 rounded-md hover:bg-editor-accent transition-colors">
                                <FileEdit size={14} />
                                <span>Edit</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Communication */}
                    <div className="flex justify-between items-center">
                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <MessageSquare size={16} />
                        <span>Message Writer</span>
                      </button>
                      
                      <button className="text-sm bg-editor-primary text-white px-4 py-2 rounded-md hover:bg-editor-accent transition-colors">
                        View Full Manuscript
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="completed">
            <div className="bg-muted/30 border rounded-md p-8 text-center">
              <h3 className="font-medium text-lg">No completed assignments yet</h3>
              <p className="text-muted-foreground">Completed assignments will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
