import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BookOpen, FileText, Check, Clock, AlertCircle, Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <Check size={16} className="text-green-500" />;
    case "in-progress":
      return <Clock size={16} className="text-amber-500" />;
    case "pending":
      return <AlertCircle size={16} className="text-gray-400" />;
    default:
      return null;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "in-progress":
      return "In Progress";
    case "pending":
      return "Pending";
    default:
      return status;
  }
};

const calculateProgress = (chapters: { status: string }[]) => {
  if (!chapters || chapters.length === 0) return 0;
  const completed = chapters.filter(c => c.status === "completed").length;
  return (completed / chapters.length) * 100;
};

const ScriptCard = ({ script }: { script: any }) => {
  // Create dummy chapters if not available
  const chapters = script.chapters || [];
  const progress = calculateProgress(chapters);
  
  return (
    <Card className="hover:border-writer-primary/30 transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-playfair">{script.title}</CardTitle>
            <div className="flex gap-2 mt-1">
              <Badge variant={script.status === "Published" ? "default" : "outline"} className="font-inter">
                {script.status || "Submitted"}
              </Badge>
              <CardDescription>{script.genre} • {new Date(script.created_at).toLocaleDateString()}</CardDescription>
            </div>
          </div>
          <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
            <BookOpen size={24} className="text-writer-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* No description field in database - removing this section */}
          
          {/* No google_docs_link field in database - removing this section */}

          {chapters.length > 0 ? (
            <>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Chapters ({chapters.length})</h4>
                <div className="space-y-1.5">
                  {chapters.map((chapter: any) => (
                    <div 
                      key={`${script.id}-chapter-${chapter.number}`}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-writer-primary font-medium">{chapter.number}.</span>
                        <span className="text-sm">{chapter.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {getStatusIcon(chapter.status)}
                        <span>{getStatusText(chapter.status)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Word Count: {script.word_count?.toLocaleString() || 'Not specified'}
              </p>
              <p className="text-sm text-muted-foreground">
                Status: {script.status || 'Unknown'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = () => (
  <div className="text-center py-12">
    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
      <BookOpen size={32} className="text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No scripts yet</h3>
    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
      Start your publishing journey by uploading your first script. Our editors are ready to help bring your story to life.
    </p>
    <Button asChild className="bg-writer-primary hover:bg-writer-accent">
      <a href="/upload">
        <Upload size={16} className="mr-2" />
        Upload Your First Script
      </a>
    </Button>
  </div>
);

const MyScripts: React.FC = () => {
  const { user } = useAuth();
  const [myScripts, setMyScripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyScripts();
  }, [user]);

  const fetchMyScripts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch manuscripts for the current user
      const { data: manuscripts, error } = await supabase
        .from('manuscripts')
        .select(`
          *,
          profiles!manuscripts_author_id_fkey(name, email)
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching manuscripts:', error);
        toast.error('Failed to load your scripts');
        return;
      }

      setMyScripts(manuscripts || []);
    } catch (error) {
      console.error('Error in fetchMyScripts:', error);
      toast.error('Failed to load your scripts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="writer">
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-playfair">My Scripts</h1>
              <p className="text-muted-foreground mt-1">Manage and track your submitted scripts</p>
            </div>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-writer-primary" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="writer">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-playfair">My Scripts</h1>
            <p className="text-muted-foreground mt-1">Manage and track your submitted scripts</p>
          </div>
          <Button asChild className="bg-writer-primary hover:bg-writer-accent">
            <a href="/upload">Upload New Script</a>
          </Button>
        </div>

        {myScripts.length === 0 ? (
          <EmptyState />
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">All Scripts ({myScripts.length})</TabsTrigger>
                <TabsTrigger value="in-review">In Review ({myScripts.filter(s => s.status === "In Review").length})</TabsTrigger>
                <TabsTrigger value="editing">Editing ({myScripts.filter(s => s.status === "Editing").length})</TabsTrigger>
                <TabsTrigger value="published">Published ({myScripts.filter(s => s.status === "Published").length})</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchMyScripts}>
                  <FileText size={16} className="mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
            
            <TabsContent value="all" className="space-y-4">
              {myScripts.map((script) => (
                <ScriptCard key={script.id} script={script} />
              ))}
            </TabsContent>
            
            <TabsContent value="in-review" className="space-y-4">
              {myScripts.filter(s => s.status === "In Review").length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No scripts currently in review
                </div>
              ) : (
                myScripts.filter(s => s.status === "In Review").map((script) => (
                  <ScriptCard key={script.id} script={script} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="editing" className="space-y-4">
              {myScripts.filter(s => s.status === "Editing").length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No scripts currently being edited
                </div>
              ) : (
                myScripts.filter(s => s.status === "Editing").map((script) => (
                  <ScriptCard key={script.id} script={script} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="published" className="space-y-4">
              {myScripts.filter(s => s.status === "Published").length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No scripts published yet
                </div>
              ) : (
                myScripts.filter(s => s.status === "Published").map((script) => (
                  <ScriptCard key={script.id} script={script} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyScripts;
