import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
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

const WriterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentScripts, setRecentScripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentScripts();
  }, [user]);

  const fetchRecentScripts = async () => {
    if (!user) return;
    
    try {
      const { data: manuscripts, error } = await supabase
        .from('manuscripts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching recent scripts:', error);
        return;
      }

      // Transform data to match expected format
      const transformedScripts = manuscripts?.map(script => ({
        id: script.id,
        title: script.title,
        status: script.status || 'Submitted',
        progress: script.status === 'Published' ? 100 : 
                 script.status === 'Editing' ? 60 : 
                 script.status === 'In Review' ? 30 : 10
      })) || [];

      setRecentScripts(transformedScripts);
    } catch (error) {
      console.error('Error in fetchRecentScripts:', error);
    } finally {
      setLoading(false);
    }
  };

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
            {recentScripts.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <BookOpen size={24} className="text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No scripts uploaded yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your first script to start tracking your submissions
                </p>
                <Button asChild className="bg-writer-primary hover:bg-writer-accent">
                  <Link to="/upload">Upload Your First Script</Link>
                </Button>
              </div>
            ) : (
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
            )}
          </CardContent>
          {recentScripts.length > 0 && (
            <CardFooter>
              <Button asChild variant="ghost" className="gap-2">
                <Link to="/my-scripts">
                  <span>View All Scripts</span>
                  <TrendingUp size={16} />
                </Link>
              </Button>
            </CardFooter>
          )}
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
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Clock size={24} className="text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No activity yet</h3>
              <p className="text-muted-foreground">
                Your recent activity and updates will appear here once you start uploading scripts
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WriterDashboard;
