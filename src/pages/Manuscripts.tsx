import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, FileText, Download, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useManuscriptList } from "@/hooks/useManuscriptList";
import { Link } from "react-router-dom";

// Feature flag to control whether we use real or mock data
const USE_SUPABASE_DATA = true;

const ManuscriptsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");

  // Use the manuscript list hook with feature flag
  const { manuscripts, isLoading, error } = useManuscriptList({
    useRealData: USE_SUPABASE_DATA,
    status: statusFilter !== "all" ? statusFilter : null,
    orderBy: "submission_date",
    orderDirection: { ascending: false }
  });

  // Get filtered manuscripts based on search and filters
  const getFilteredManuscripts = () => {
    if (!manuscripts) return [];
    
    return manuscripts.filter((manuscript) => {
      // Search term filter
      const matchesSearch = 
        manuscript.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (manuscript.author && manuscript.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (manuscript.editor && manuscript.editor.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Genre filter
      const matchesGenre = 
        genreFilter === "all" || 
        (manuscript.genre && manuscript.genre.toLowerCase() === genreFilter.toLowerCase());
      
      return matchesSearch && matchesGenre;
    });
  };

  const filteredManuscripts = getFilteredManuscripts();

  // Function to determine the color of the progress bar
  const getProgressColor = (progress: number, status: string) => {
    if (status === "Completed") return "bg-green-500";
    if (progress < 30) return "bg-amber-500";
    if (progress < 70) return "bg-blue-500";
    return "bg-violet-500";
  };

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "published":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Published</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>;
      case "under_review":
        return <Badge variant="outline" className="bg-violet-100 text-violet-800 border-violet-200">Under Review</Badge>;
      case "submitted":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Submitted</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case "revision_requested":
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Revision Requested</Badge>;
      case "draft":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate statistics
  const totalManuscripts = manuscripts?.length || 0;
  const inProgressCount = manuscripts?.filter(m => m.status === "in_progress").length || 0;
  const completedCount = manuscripts?.filter(m => m.status === "published" || m.status === "approved").length || 0;
  const uniqueEditors = new Set(manuscripts?.map(m => m.editor).filter(e => e && e !== 'To be determined')).size;

  if (isLoading) {
    return (
      <DashboardLayout role="publisher">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-muted-foreground">Loading manuscripts...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="publisher">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error loading manuscripts: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="publisher">
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Manuscripts</h1>
            <p className="text-muted-foreground mt-1">Manage all acquired scripts and their progress</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="gap-2">
              <Download size={16} />
              <span>Export Data</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="gradient-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="bg-admin-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-3">
                  <BookOpen className="text-admin-primary" />
                </div>
                <h3 className="font-semibold text-2xl">{totalManuscripts}</h3>
                <p className="text-muted-foreground">Total Manuscripts</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="bg-admin-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-3">
                  <FileText className="text-admin-primary" />
                </div>
                <h3 className="font-semibold text-2xl">{inProgressCount}</h3>
                <p className="text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="bg-admin-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-3">
                  <Users className="text-admin-primary" />
                </div>
                <h3 className="font-semibold text-2xl">{uniqueEditors}</h3>
                <p className="text-muted-foreground">Active Editors</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="bg-admin-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-3">
                  <BookOpen className="text-admin-primary" />
                </div>
                <h3 className="font-semibold text-2xl">{completedCount}</h3>
                <p className="text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtering options */}
        <Card>
          <CardHeader>
            <CardTitle>All Manuscripts</CardTitle>
            <CardDescription>
              Browse and manage all acquired scripts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search by title, writer, or editor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="revision_requested">Revision Requested</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    <SelectItem value="psychological thriller">Psychological Thriller</SelectItem>
                    <SelectItem value="cozy mystery">Cozy Mystery</SelectItem>
                    <SelectItem value="art crime mystery">Art Crime Mystery</SelectItem>
                    <SelectItem value="police procedural">Police Procedural</SelectItem>
                    <SelectItem value="cultural mystery">Cultural Mystery</SelectItem>
                    <SelectItem value="cyber crime">Cyber Crime</SelectItem>
                    <SelectItem value="tech thriller">Tech Thriller</SelectItem>
                    <SelectItem value="historical mystery">Historical Mystery</SelectItem>
                    <SelectItem value="period mystery">Period Mystery</SelectItem>
                    <SelectItem value="gothic mystery">Gothic Mystery</SelectItem>
                    <SelectItem value="supernatural mystery">Supernatural Mystery</SelectItem>
                    <SelectItem value="young adult mystery">Young Adult Mystery</SelectItem>
                    <SelectItem value="teen mystery">Teen Mystery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Writer</TableHead>
                    <TableHead>Editor</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredManuscripts.length > 0 ? (
                    filteredManuscripts.map((manuscript) => (
                      <TableRow key={manuscript.id}>
                        <TableCell className="font-medium">{manuscript.title}</TableCell>
                        <TableCell>{manuscript.author || 'Unknown'}</TableCell>
                        <TableCell>
                          {!manuscript.editor ? (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800">
                              Unassigned
                            </Badge>
                          ) : (
                            manuscript.editor
                          )}
                        </TableCell>
                        <TableCell>{manuscript.genre || 'Unknown'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={manuscript.progress || 0}
                              className="h-2"
                              indicatorClassName={getProgressColor(manuscript.progress || 0, manuscript.status)}
                            />
                            <span className="text-xs w-9 text-muted-foreground">{manuscript.progress || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(manuscript.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/manuscripts/${manuscript.id}`}>Details</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No manuscripts found matching your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManuscriptsPage;
