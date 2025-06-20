import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, FileText, Check, Clock, AlertCircle, Upload, Loader2, DollarSign, Edit3, CreditCard, Users, Plus, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useEditorManagement } from "@/hooks/useEditorManagement";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <Check size={16} className="text-green-500" />;
    case "in-progress":
    case "editing":
      return <Clock size={16} className="text-amber-500" />;
    case "pending":
    case "submitted":
      return <AlertCircle size={16} className="text-gray-400" />;
    case "published":
      return <Check size={16} className="text-green-600" />;
    case "payment_received":
      return <CreditCard size={16} className="text-blue-500" />;
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
    case "editing":
      return "Being Edited";
    case "pending":
      return "Pending";
    case "submitted":
      return "Submitted";
    case "published":
      return "Published";
    case "payment_received":
      return "Payment Received";
    default:
      return status;
  }
};

const getPaymentStatusBadge = (paymentStatus: string) => {
  switch (paymentStatus) {
    case "paid":
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Paid</Badge>;
    case "pending":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline" className="bg-red-50 text-red-700">Unpaid</Badge>;
  }
};

const getEditingStatusBadge = (status: string) => {
  switch (status) {
    case "editing":
    case "in_progress":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        <Edit3 size={12} className="mr-1" />
        In Progress
      </Badge>;
    case "completed":
    case "edited":
      return <Badge variant="secondary" className="bg-green-100 text-green-800">
        <Check size={12} className="mr-1" />
        Completed
      </Badge>;
    case "payment_received":
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">
        <Clock size={12} className="mr-1" />
        Queued
      </Badge>;
    case "published":
      return <Badge variant="default" className="bg-purple-100 text-purple-800">
        <Check size={12} className="mr-1" />
        Published
      </Badge>;
    default:
      return <Badge variant="outline">
        <AlertCircle size={12} className="mr-1" />
        Submitted
      </Badge>;
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
  
  const formatDeadline = (deadline: string) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return "Due today";
    } else {
      return `Due in ${diffDays} days`;
    }
  };
  
  return (
    <Card className="hover:border-writer-primary/30 transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-playfair">{script.title}</CardTitle>
            <div className="flex gap-2 mt-1 flex-wrap">
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
          {/* Payment and Editing Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium">Payment Status</span>
              </div>
              {getPaymentStatusBadge(script.payment_status || "unpaid")}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Edit3 size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium">Editing Status</span>
              </div>
              {getEditingStatusBadge(script.status || "submitted")}
            </div>
          </div>

          {/* Manuscript Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Word Count:</span>
              <span className="ml-2 font-medium">{script.word_count?.toLocaleString() || 'Not specified'}</span>
            </div>
            {script.deadline && (
              <div>
                <span className="text-muted-foreground">Deadline:</span>
                <span className={`ml-2 font-medium ${
                  formatDeadline(script.deadline)?.includes('Overdue') ? 'text-red-600' : 
                  formatDeadline(script.deadline)?.includes('Due today') ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {formatDeadline(script.deadline)}
                </span>
              </div>
            )}
          </div>

          {/* Payment Button for Unpaid Scripts */}
          {script.payment_status !== "paid" && (
            <Button 
              variant="outline" 
              size="sm"
              className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => window.location.href = `/payments?manuscript_id=${script.id}&word_count=${script.word_count || 0}`}
            >
              <CreditCard size={16} className="mr-2" />
              Complete Payment
            </Button>
          )}

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
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

const PublisherScriptCard = ({ script, onAssignEditor, editors }: { 
  script: any; 
  onAssignEditor: (manuscriptId: string, editorId: string) => void;
  editors: any[];
}) => {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState("");
  
  // Calculate progress from assignments
  const assignments = script.assignments || [];
  const progress = assignments.length > 0 ? 
    assignments.reduce((acc: number, assignment: any) => acc + (assignment.progress || 0), 0) / assignments.length : 0;

  const handleAssignEditor = () => {
    if (selectedEditor) {
      onAssignEditor(script.id, selectedEditor);
      setShowAssignDialog(false);
      setSelectedEditor("");
    }
  };

  const formatDeadline = (deadline: string) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return "Due today";
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  return (
    <>
      <Card className="hover:border-primary/30 transition-all">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-playfair">{script.title}</CardTitle>
              <div className="flex gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="font-inter">
                  {script.genre || "Unknown Genre"}
                </Badge>
                <CardDescription>
                  by {script.profiles?.name || "Unknown Author"} • {new Date(script.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
            <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
              <BookOpen size={24} className="text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Payment Status and Purchase Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Purchase Status</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Check size={12} className="mr-1" />
                  Purchased
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Edit3 size={14} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Editing Status</span>
                </div>
                {getEditingStatusBadge(script.status || "purchased_by_publisher")}
              </div>
            </div>

            {/* Manuscript Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Word Count:</span>
                <span className="ml-2 font-medium">{script.word_count?.toLocaleString() || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Purchase Date:</span>
                <span className="ml-2 font-medium">
                  {script.publisher_purchases?.[0]?.purchase_date ? 
                    new Date(script.publisher_purchases[0].purchase_date).toLocaleDateString() : 
                    'Recently purchased'
                  }
                </span>
              </div>
            </div>

            {/* Editor Assignment Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Assigned Editors</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAssignDialog(true)}
                  className="text-xs"
                >
                  <UserPlus size={12} className="mr-1" />
                  Assign Editor
                </Button>
              </div>
              
              {assignments.length > 0 ? (
                <div className="space-y-2">
                  {assignments.map((assignment: any) => (
                    <div key={assignment.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users size={14} className="text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{assignment.profiles?.name || "Editor"}</div>
                          <div className="text-xs text-muted-foreground">
                            {assignment.assignment_type || "Editing"} • {assignment.status || "Assigned"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{assignment.progress || 0}%</div>
                        <div className="text-xs text-muted-foreground">
                          {assignment.deadline ? formatDeadline(assignment.deadline) : "No deadline"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground bg-muted/30 rounded-lg">
                  <Users className="mx-auto h-8 w-8 mb-2 text-muted-foreground" />
                  <p className="text-sm">No editors assigned yet</p>
                  <p className="text-xs">Click "Assign Editor" to get started</p>
                </div>
              )}
            </div>

            {/* Progress Section */}
            {assignments.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Overall Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assign Editor Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Editor to "{script.title}"</DialogTitle>
            <DialogDescription>
              Select an editor to work on this manuscript. You can assign multiple editors for different aspects of the work.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Editor:</label>
              <Select value={selectedEditor} onValueChange={setSelectedEditor}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose an editor..." />
                </SelectTrigger>
                <SelectContent>
                  {editors.filter(editor => editor.is_available).map((editor) => (
                    <SelectItem key={editor.id} value={editor.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{editor.name}</span>
                        <div className="text-xs text-muted-foreground ml-2">
                          {editor.specialties?.slice(0, 2).join(", ") || "General Editing"}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {editors.length === 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  You don't have any editors yet. 
                  <Button variant="link" className="p-0 h-auto ml-1" asChild>
                    <a href="/editor-marketplace">Create editor profiles first</a>
                  </Button>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignEditor}
              disabled={!selectedEditor}
            >
              Assign Editor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
  const { editors, assignEditor } = useEditorManagement();

  useEffect(() => {
    fetchMyScripts();
  }, [user]);

  const fetchMyScripts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      if (user.role === 'publisher') {
        // Fetch manuscripts purchased by this publisher
        const { data: manuscripts, error } = await supabase
          .from('manuscripts')
          .select(`
            *,
            profiles!manuscripts_author_id_fkey(name, role, avatar_url),
            publisher_purchases!inner(purchase_date, purchase_price, status),
            assignments(
              id,
              editor_id,
              status,
              progress,
              deadline,
              assignment_type,
              profiles!assignments_editor_id_fkey(name, avatar_url)
            )
          `)
          .eq('publisher_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching publisher manuscripts:', error);
          toast.error('Failed to load your purchased manuscripts');
          return;
        }

        setMyScripts(manuscripts || []);
      } else {
        // Fetch manuscripts for writers (original functionality)
        const { data: manuscripts, error } = await supabase
          .from('manuscripts')
          .select(`
            *,
            profiles!manuscripts_author_id_fkey(name, role, avatar_url)
          `)
          .eq('author_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching manuscripts:', error);
          toast.error('Failed to load your scripts');
          return;
        }

        setMyScripts(manuscripts || []);
      }
    } catch (error) {
      console.error('Error in fetchMyScripts:', error);
      toast.error('Failed to load your scripts');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEditor = async (manuscriptId: string, editorId: string) => {
    try {
      await assignEditor(manuscriptId, editorId, {
        type: 'editing',
        priority: 'Medium'
      });
      
      // Refresh the scripts to show the new assignment
      await fetchMyScripts();
      toast.success('Editor assigned successfully!');
    } catch (error) {
      console.error('Error assigning editor:', error);
      toast.error('Failed to assign editor');
    }
  };

  if (loading) {
    return (
      <DashboardLayout role={user?.role || "writer"}>
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-playfair">
                {user?.role === 'publisher' ? 'My Purchased Manuscripts' : 'My Scripts'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {user?.role === 'publisher' 
                  ? 'Manage your purchased manuscripts and editor assignments' 
                  : 'Manage and track your submitted scripts'
                }
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isPublisher = user?.role === 'publisher';

  return (
    <DashboardLayout role={user?.role || "writer"}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-playfair">
              {isPublisher ? 'My Purchased Manuscripts' : 'My Scripts'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isPublisher 
                ? 'Manage your purchased manuscripts and editor assignments' 
                : 'Manage and track your submitted scripts'
              }
            </p>
          </div>
          {isPublisher ? (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href="/editor-marketplace">
                  <UserPlus size={16} className="mr-2" />
                  Manage Editors
                </a>
              </Button>
              <Button asChild>
                <a href="/publisher-marketplace">
                  <Plus size={16} className="mr-2" />
                  Buy Manuscripts
                </a>
              </Button>
            </div>
          ) : (
            <Button asChild className="bg-writer-primary hover:bg-writer-accent">
              <a href="/upload">Upload New Script</a>
            </Button>
          )}
        </div>

        {myScripts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <BookOpen size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {isPublisher ? 'No manuscripts purchased yet' : 'No scripts yet'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {isPublisher 
                ? 'Browse the marketplace to discover and purchase manuscripts from talented writers.'
                : 'Start your publishing journey by uploading your first script. Our editors are ready to help bring your story to life.'
              }
            </p>
            <Button asChild>
              <a href={isPublisher ? "/publisher-marketplace" : "/upload"}>
                {isPublisher ? 'Browse Marketplace' : 'Upload Your First Script'}
              </a>
            </Button>
          </div>
        ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All {isPublisher ? 'Manuscripts' : 'Scripts'} ({myScripts.length})</TabsTrigger>
              {isPublisher ? (
                <>
                  <TabsTrigger value="unassigned">Unassigned ({myScripts.filter(s => !s.assignments || s.assignments.length === 0).length})</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress ({myScripts.filter(s => s.assignments && s.assignments.some((a: any) => a.status === "in_progress" || a.status === "assigned")).length})</TabsTrigger>
                  <TabsTrigger value="completed">Completed ({myScripts.filter(s => s.status === "completed").length})</TabsTrigger>
                </>
              ) : (
                <>
                  <TabsTrigger value="unpaid">Unpaid ({myScripts.filter(s => s.payment_status !== "paid").length})</TabsTrigger>
                  <TabsTrigger value="editing">In Editing ({myScripts.filter(s => s.status === "editing" || s.status === "in_progress").length})</TabsTrigger>
                  <TabsTrigger value="completed">Completed ({myScripts.filter(s => s.status === "completed" || s.status === "published").length})</TabsTrigger>
                </>
              )}
            </TabsList>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchMyScripts}>
                <FileText size={16} className="mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          <TabsContent value="all" className="space-y-4">
            {myScripts.map((script) => 
              isPublisher ? (
                <PublisherScriptCard 
                  key={script.id} 
                  script={script} 
                  onAssignEditor={handleAssignEditor}
                  editors={editors}
                />
              ) : (
                <ScriptCard key={script.id} script={script} />
              )
            )}
          </TabsContent>
          
          {isPublisher ? (
            <>
              <TabsContent value="unassigned" className="space-y-4">
                {myScripts.filter(s => !s.assignments || s.assignments.length === 0).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">All manuscripts have editors assigned!</h3>
                    <p>Great work! All your manuscripts are being worked on.</p>
                  </div>
                ) : (
                  myScripts.filter(s => !s.assignments || s.assignments.length === 0).map((script) => (
                    <PublisherScriptCard 
                      key={script.id} 
                      script={script} 
                      onAssignEditor={handleAssignEditor}
                      editors={editors}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="in-progress" className="space-y-4">
                {myScripts.filter(s => s.assignments && s.assignments.some((a: any) => a.status === "in_progress" || a.status === "assigned")).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Edit3 className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No manuscripts currently in progress</h3>
                    <p>Assign editors to your manuscripts to get started.</p>
                  </div>
                ) : (
                  myScripts.filter(s => s.assignments && s.assignments.some((a: any) => a.status === "in_progress" || a.status === "assigned")).map((script) => (
                    <PublisherScriptCard 
                      key={script.id} 
                      script={script} 
                      onAssignEditor={handleAssignEditor}
                      editors={editors}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="space-y-4">
                {myScripts.filter(s => s.status === "completed").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Check className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No completed manuscripts yet</h3>
                    <p>Your finished manuscripts will appear here once editing is complete.</p>
                  </div>
                ) : (
                  myScripts.filter(s => s.status === "completed").map((script) => (
                    <PublisherScriptCard 
                      key={script.id} 
                      script={script} 
                      onAssignEditor={handleAssignEditor}
                      editors={editors}
                    />
                  ))
                )}
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="unpaid" className="space-y-4">
                {myScripts.filter(s => s.payment_status !== "paid").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">All payments complete!</h3>
                    <p>All your scripts have been paid for and are in the editing queue.</p>
                  </div>
                ) : (
                  myScripts.filter(s => s.payment_status !== "paid").map((script) => (
                    <ScriptCard key={script.id} script={script} />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="editing" className="space-y-4">
                {myScripts.filter(s => s.status === "editing" || s.status === "in_progress").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Edit3 className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No scripts currently being edited</h3>
                    <p>Your scripts will appear here once they're assigned to an editor.</p>
                  </div>
                ) : (
                  myScripts.filter(s => s.status === "editing" || s.status === "in_progress").map((script) => (
                    <ScriptCard key={script.id} script={script} />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="space-y-4">
                {myScripts.filter(s => s.status === "completed" || s.status === "published").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Check className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No completed scripts yet</h3>
                    <p>Your finished manuscripts will appear here once editing is complete.</p>
                  </div>
                ) : (
                  myScripts.filter(s => s.status === "completed" || s.status === "published").map((script) => (
                    <ScriptCard key={script.id} script={script} />
                  ))
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyScripts;
