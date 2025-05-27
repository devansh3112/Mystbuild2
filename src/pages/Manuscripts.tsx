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

// Mock data for manuscripts
const manuscriptData = [
  {
    id: "ms-001",
    title: "The Lost Chapter",
    writer: "Sarah Johnson",
    editor: "Mark Davis",
    genre: "Mystery",
    progress: 75,
    wordCount: 78000,
    status: "In Progress",
    acquisitionDate: "2025-03-15",
    completionDate: "2025-06-20",
  },
  {
    id: "ms-002",
    title: "Beyond the Stars",
    writer: "Michael Chen",
    editor: "Unassigned",
    genre: "Science Fiction",
    progress: 10,
    wordCount: 92000,
    status: "New",
    acquisitionDate: "2025-05-02",
    completionDate: "2025-08-30",
  },
  {
    id: "ms-003",
    title: "Shadows of Tomorrow",
    writer: "Elena Rodriguez",
    editor: "Priya Sharma",
    genre: "Thriller",
    progress: 100,
    wordCount: 68500,
    status: "Completed",
    acquisitionDate: "2025-02-10",
    completionDate: "2025-04-30",
  },
  {
    id: "ms-004",
    title: "Whispers in the Dark",
    writer: "David Wilson",
    editor: "Mark Davis",
    genre: "Horror",
    progress: 60,
    wordCount: 71200,
    status: "In Progress",
    acquisitionDate: "2025-03-25",
    completionDate: "2025-06-15",
  },
  {
    id: "ms-005",
    title: "The Emerald Crown",
    writer: "Jessica Lee",
    editor: "James Wilson",
    genre: "Fantasy",
    progress: 40,
    wordCount: 105000,
    status: "In Progress",
    acquisitionDate: "2025-04-05",
    completionDate: "2025-07-20",
  },
  {
    id: "ms-006",
    title: "Midnight Secrets",
    writer: "Robert Taylor",
    editor: "Priya Sharma",
    genre: "Mystery",
    progress: 90,
    wordCount: 84300,
    status: "Review",
    acquisitionDate: "2025-02-28",
    completionDate: "2025-05-10",
  },
];

const ManuscriptsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");

  // Get filtered manuscripts based on search and filters
  const getFilteredManuscripts = () => {
    return manuscriptData.filter((manuscript) => {
      // Search term filter
      const matchesSearch = 
        manuscript.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manuscript.writer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manuscript.editor.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = 
        statusFilter === "all" || 
        manuscript.status.toLowerCase() === statusFilter.toLowerCase();
      
      // Genre filter
      const matchesGenre = 
        genreFilter === "all" || 
        manuscript.genre.toLowerCase() === genreFilter.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesGenre;
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
    switch (status) {
      case "Completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "In Progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case "New":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">New</Badge>;
      case "Review":
        return <Badge variant="outline" className="bg-violet-100 text-violet-800 border-violet-200">In Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout role="publisher">
      <div className="space-y-6 animate-fade-in">
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
                <h3 className="font-semibold text-2xl">{manuscriptData.length}</h3>
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
                <h3 className="font-semibold text-2xl">
                  {manuscriptData.filter(m => m.status === "In Progress").length}
                </h3>
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
                <h3 className="font-semibold text-2xl">
                  {new Set(manuscriptData.map(m => m.editor)).size}
                </h3>
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
                <h3 className="font-semibold text-2xl">
                  {manuscriptData.filter(m => m.status === "Completed").length}
                </h3>
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
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="review">In Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    <SelectItem value="mystery">Mystery</SelectItem>
                    <SelectItem value="science fiction">Science Fiction</SelectItem>
                    <SelectItem value="thriller">Thriller</SelectItem>
                    <SelectItem value="horror">Horror</SelectItem>
                    <SelectItem value="fantasy">Fantasy</SelectItem>
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
                        <TableCell>{manuscript.writer}</TableCell>
                        <TableCell>
                          {manuscript.editor === "Unassigned" ? (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800">
                              Unassigned
                            </Badge>
                          ) : (
                            manuscript.editor
                          )}
                        </TableCell>
                        <TableCell>{manuscript.genre}</TableCell>
                        <TableCell className="w-[200px]">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={manuscript.progress}
                              className="h-2"
                              indicatorClassName={getProgressColor(manuscript.progress, manuscript.status)}
                            />
                            <span className="text-xs w-9 text-muted-foreground">{manuscript.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(manuscript.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Details
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
