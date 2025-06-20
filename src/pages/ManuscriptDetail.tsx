import React from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  FileText, 
  Star,
  Clock,
  BookOpen,
  Edit3,
  MessageSquare,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useManuscript } from "@/hooks/useManuscript";
import { useChapterMutations } from "@/hooks/useChapterMutations";
import { useEditor } from "@/hooks/useEditor";

// Feature flag to control whether we use real or mock data
const USE_SUPABASE_DATA = true;

const ManuscriptDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  
  // Use the manuscript hook with feature flag
  const { manuscript, isLoading, error } = useManuscript(id, {
    useRealData: USE_SUPABASE_DATA
  });

  // Use chapter mutations for status updates
  const { 
    updateChapterStatus, 
    updateChapterProgress,
    isLoading: isUpdatingChapter
  } = useChapterMutations();

  // Use editor hook for assignment functionality
  const { 
    editors, 
    assignEditor, 
    isLoading: isLoadingEditors 
  } = useEditor({
    useRealData: USE_SUPABASE_DATA,
    status: 'active'
  });

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "In Progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case "New":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">New</Badge>;
      case "In Review":
        return <Badge variant="outline" className="bg-violet-100 text-violet-800 border-violet-200">In Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getChapterStatusBadge = (status: string) => {
    switch (status) {
      case "Reviewed":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Reviewed</Badge>;
      case "In Review":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Review</Badge>;
      case "Not Started":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Not Started</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle chapter status update
  const handleChapterStatusUpdate = async (chapterId: string, newStatus: string) => {
    const result = await updateChapterStatus(chapterId, newStatus);
    
    if (result.success) {
      toast.success(`Chapter status changed to ${newStatus}`);
      // Optionally refresh the data here
    } else {
      toast.error(result.error);
    }
  };

  // Handle editor assignment
  const handleEditorAssignment = async (editorId: string) => {
    if (!manuscript?.id) return;
    
    const result = await assignEditor(manuscript.id, editorId);
    
    if (result.success) {
      const selectedEditor = editors.find(e => e.id === editorId);
      toast.success(`${selectedEditor?.name} has been assigned to this manuscript`);
      // Optionally refresh the data here
    } else {
      toast.error(result.error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role={user?.role || "publisher"}>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading manuscript details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role={user?.role || "publisher"}>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error loading manuscript: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!manuscript) {
    return (
      <DashboardLayout role={user?.role || "publisher"}>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Manuscript not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={user?.role || "publisher"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/manuscripts">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Manuscripts
            </Link>
          </Button>
        </div>

        {/* Manuscript Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{manuscript.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {manuscript.abstract || manuscript.synopsis || "No description available"}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(manuscript.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Genre</p>
                    <p className="font-medium">{manuscript.genre || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Word Count</p>
                    <p className="font-medium">{manuscript.word_count?.toLocaleString() || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-medium">{formatDate(manuscript.submission_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-medium">
                      {manuscript.deadline ? formatDate(manuscript.deadline) : "Not set"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Author Card */}
            {manuscript.author && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Author
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={manuscript.author.avatar} />
                      <AvatarFallback>
                        {manuscript.author.name?.split(' ').map(n => n[0]).join('') || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{manuscript.author.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email || 'Email not available'}</p>
                    </div>
                  </div>
                  {manuscript.author.bio && (
                    <p className="text-sm text-muted-foreground mt-3">
                      {manuscript.author.bio}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Editor Card */}
            {manuscript.editor ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Editor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={manuscript.editor.avatar} />
                      <AvatarFallback>
                        {manuscript.editor.name?.split(' ').map(n => n[0]).join('') || 'E'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{manuscript.editor.name}</p>
                                              <p className="text-sm text-muted-foreground">Editor assigned</p>
                    </div>
                  </div>
                  {manuscript.editor.bio && (
                    <p className="text-sm text-muted-foreground mt-3">
                      {manuscript.editor.bio}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Editor Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">No editor assigned</p>
                  {user?.role === 'publisher' && (
                    <Select onValueChange={handleEditorAssignment} disabled={isLoadingEditors}>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign an editor" />
                      </SelectTrigger>
                      <SelectContent>
                        {editors.map((editor) => (
                          <SelectItem key={editor.id} value={editor.id}>
                            {editor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Chapters */}
        {manuscript.chapters && manuscript.chapters.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Chapters ({manuscript.chapters.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {manuscript.chapters.map((chapter) => (
                  <div key={chapter.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">Chapter {chapter.number}: {chapter.title}</h4>
                        {chapter.feedback && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {chapter.feedback}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {user?.role === 'editor' && (
                          <Select 
                            defaultValue={chapter.status}
                            onValueChange={(value) => handleChapterStatusUpdate(chapter.id, value)}
                            disabled={isUpdatingChapter}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Not Started">Not Started</SelectItem>
                              <SelectItem value="In Review">In Review</SelectItem>
                              <SelectItem value="Reviewed">Reviewed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        {getChapterStatusBadge(chapter.status)}
                      </div>
                    </div>
                    {chapter.progress !== undefined && (
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={chapter.progress} className="h-2" />
                        <span className="text-xs text-muted-foreground w-12">
                          {chapter.progress}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        {manuscript.reviews && manuscript.reviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Reviews ({manuscript.reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {manuscript.reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{review.reviewer_name}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(review.date)}
                      </p>
                    </div>
                    <p className="text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManuscriptDetail; 