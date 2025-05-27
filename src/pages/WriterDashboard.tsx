
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  BookOpen, 
  MessageSquare, 
  TrendingUp, 
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

// Sample data for the writer dashboard
const recentScripts = [
  { id: 1, title: "The Lost Chapter", status: "In Review", progress: 65 },
  { id: 2, title: "Midnight Dreams", status: "Editing", progress: 40 },
  { id: 3, title: "Shadows of Tomorrow", status: "Published", progress: 100 },
];

const WriterDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout role="writer">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your scripts and activity</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="gradient-card">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="bg-writer-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-3">
                <Upload className="text-writer-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Upload New Script</h3>
              <p className="text-sm text-muted-foreground mb-4">Start the publishing process with your latest work</p>
              <Button asChild className="bg-writer-primary hover:bg-writer-accent">
                <Link to="/upload">Upload Now</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="gradient-card">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="bg-writer-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-3">
                <BookOpen className="text-writer-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">My Scripts</h3>
              <p className="text-sm text-muted-foreground mb-4">View and manage all your submitted scripts</p>
              <Button asChild variant="outline" className="border-writer-primary text-writer-primary">
                <Link to="/my-scripts">View All</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="gradient-card">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="bg-writer-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-3">
                <MessageSquare className="text-writer-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Messages</h3>
              <p className="text-sm text-muted-foreground mb-4">Communicate with your editors about revisions</p>
              <Button asChild variant="outline" className="border-writer-primary text-writer-primary">
                <Link to="/messages">Open Messages</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Scripts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Scripts</CardTitle>
            <CardDescription>
              Track the editing progress of your recent submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentScripts.map((script) => (
                <div key={script.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0">
                    <BookOpen className="text-writer-primary" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{script.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span 
                        className={`text-xs px-2 py-1 rounded-full ${
                          script.status === "Published" 
                            ? "bg-success/20 text-success" 
                            : script.status === "In Review" 
                              ? "bg-amber-500/20 text-amber-700" 
                              : "bg-blue-500/20 text-blue-700"
                        }`}
                      >
                        {script.status}
                      </span>
                      <div className="flex-1 progress-bar">
                        <div 
                          className="progress-value"
                          style={{ width: `${script.progress}%` }} 
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {script.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" className="gap-2">
              <Link to="/my-scripts">
                <span>View All Scripts</span>
                <TrendingUp size={16} />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and feedback on your scripts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageSquare size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">New comment on "The Lost Chapter"</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your editor left feedback on chapter 3
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock size={12} /> 2 hours ago
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Editing progress updated</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    "Midnight Dreams" is now at 40% completion
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock size={12} /> 1 day ago
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                  <Upload size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">New script uploaded</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You've uploaded "The Lost Chapter" successfully
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock size={12} /> 3 days ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WriterDashboard;
