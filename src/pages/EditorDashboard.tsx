
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileEdit, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  BarChart,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import ChapterProgressList, { ManuscriptWithChapters, ChapterStatus } from "@/components/ChapterProgressList";

// Sample data for the editor dashboard
const assignedScripts: ManuscriptWithChapters[] = [
  { 
    id: 1, 
    title: "The Lost Chapter", 
    author: "Sarah Johnson",
    authorId: "w1",
    deadline: "May 20, 2025", 
    priority: "Medium",
    chapters: [
      { id: 1, title: "The Beginning", progress: 100, status: "Completed" },
      { id: 2, title: "The Discovery", progress: 75, status: "In Progress" },
      { id: 3, title: "The Journey", progress: 50, status: "In Progress" },
      { id: 4, title: "The Revelation", progress: 30, status: "In Progress" },
      { id: 5, title: "The End", progress: 0, status: "Not Started" },
    ]
  },
  { 
    id: 2, 
    title: "Beyond the Stars", 
    author: "Michael Chen",
    authorId: "w2",
    deadline: "May 18, 2025", 
    priority: "High",
    chapters: [
      { id: 1, title: "First Contact", progress: 0, status: "Not Started" },
      { id: 2, title: "Alien Civilization", progress: 0, status: "Not Started" },
      { id: 3, title: "Return Home", progress: 0, status: "Not Started" },
    ]
  },
  { 
    id: 3, 
    title: "Shadows of Tomorrow", 
    author: "Elena Rodriguez",
    authorId: "w3",
    deadline: "May 30, 2025", 
    priority: "Low",
    chapters: [
      { id: 1, title: "Darkness Falls", progress: 30, status: "In Progress" },
      { id: 2, title: "The Light Within", progress: 20, status: "In Progress" },
      { id: 3, title: "Dawn", progress: 0, status: "Not Started" },
      { id: 4, title: "New Day", progress: 0, status: "Not Started" },
    ]
  },
];

const EditorDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout role="editor">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Editor Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your assigned manuscripts and tasks</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="gradient-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="bg-editor-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-3">
                  <FileEdit className="text-editor-primary" />
                </div>
                <h3 className="font-semibold text-2xl">3</h3>
                <p className="text-muted-foreground">Assigned Scripts</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="bg-editor-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-3">
                  <CheckCircle className="text-editor-primary" />
                </div>
                <h3 className="font-semibold text-2xl">1</h3>
                <p className="text-muted-foreground">Due This Week</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="bg-editor-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-3">
                  <MessageSquare className="text-editor-primary" />
                </div>
                <h3 className="font-semibold text-2xl">5</h3>
                <p className="text-muted-foreground">New Messages</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Current Assignments</CardTitle>
            <CardDescription>
              Scripts that need your attention, ordered by priority
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignedScripts.map((script) => (
                <ChapterProgressList key={script.id} manuscript={script} />
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" className="gap-2">
              <Link to="/assignments">
                <span>View All Assignments</span>
                <TrendingUp size={16} />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Your editing statistics for the past month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <div className="mb-2 text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground text-center">Manuscripts Completed</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-2 text-2xl font-bold">98%</div>
                <div className="text-sm text-muted-foreground text-center">On-time Completion</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-2 text-2xl font-bold">4.9/5</div>
                <div className="text-sm text-muted-foreground text-center">Writer Satisfaction</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" className="gap-2">
              <BarChart size={16} />
              <span>View Full Statistics</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EditorDashboard;
