import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  BarChart,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  Calendar,
  ChevronDown,
  UserPlus,
  AlertCircle,
  DollarSign,
  Mail
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminData } from "@/hooks/useAdminData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// FEATURE FLAG - set to true to use real Supabase data
const USE_SUPABASE_DATA = true;

// Sample data for the admin dashboard
const recentManuscripts = [
  { 
    id: 1, 
    title: "The Lost Chapter", 
    author: "Sarah Johnson",
    editor: "Mark Davis",
    status: "In Progress", 
    submitted: "May 10, 2025",
    deadline: "May 25, 2025"
  },
  { 
    id: 2, 
    title: "Beyond the Stars", 
    author: "Michael Chen",
    editor: "Unassigned",
    status: "New", 
    submitted: "May 15, 2025",
    deadline: "June 1, 2025"
  },
  { 
    id: 3, 
    title: "Shadows of Tomorrow", 
    author: "Elena Rodriguez",
    editor: "Priya Sharma",
    status: "Completed", 
    submitted: "April 28, 2025",
    deadline: "May 15, 2025"
  },
  { 
    id: 4, 
    title: "Whispers in the Dark", 
    author: "David Wilson",
    editor: "Mark Davis",
    status: "In Progress", 
    submitted: "May 8, 2025",
    deadline: "May 22, 2025"
  },
];

const editorPerformance = [
  {
    id: 1,
    name: "Mark Davis",
    assigned: 5,
    completed: 3,
    satisfaction: 4.8,
    onTime: "100%"
  },
  {
    id: 2,
    name: "Priya Sharma",
    assigned: 4,
    completed: 4,
    satisfaction: 4.9,
    onTime: "100%"
  },
  {
    id: 3,
    name: "James Wilson",
    assigned: 6,
    completed: 5,
    satisfaction: 4.7,
    onTime: "95%"
  }
];

interface EditorInvitation {
  id: string;
  email: string;
  name: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
}

interface Editor {
  id: string;
  name: string;
  email: string;
  specialties?: string[];
  total_manuscripts_edited: number;
  average_rating: number;
  availability_status: string;
}

const AdminDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [timeframe, setTimeframe] = React.useState("this-month");
  const { isLoading, error, dashboardData } = useAdminData({ useRealData: USE_SUPABASE_DATA });
  const [loading, setLoading] = useState(true);
  const [editorInvitations, setEditorInvitations] = useState<EditorInvitation[]>([]);
  const [editors, setEditors] = useState<Editor[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitationResult, setInvitationResult] = useState<{
    success: boolean;
    invitation_url: string;
    email: string;
    name: string;
  } | null>(null);

  // Existing dashboard data states
  const [totalManuscripts, setTotalManuscripts] = useState(0);
  const [activeEditors, setActiveEditors] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Debug user information
  useEffect(() => {
    console.log("AdminDashboard - Current user:", user);
    console.log("AdminDashboard - Data loading status:", { isLoading, error, hasData: !!dashboardData });
  }, [user, isLoading, error, dashboardData]);

  useEffect(() => {
    if (user && user.role === 'publisher') {
      fetchDashboardData();
      fetchEditorInvitations();
      fetchEditors();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch manuscripts count
      const { count: manuscriptsCount } = await supabase
        .from('manuscripts')
        .select('*', { count: 'exact', head: true });

      // Fetch active editors count
      const { count: editorsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'editor');

      setTotalManuscripts(manuscriptsCount || 0);
      setActiveEditors(editorsCount || 0);
      setTotalRevenue(12500); // Mock data for now
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchEditorInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('editor_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEditorInvitations(data || []);
    } catch (error) {
      console.error('Error fetching editor invitations:', error);
    }
  };

  const fetchEditors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'editor')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEditors(data || []);
    } catch (error) {
      console.error('Error fetching editors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteEditor = async () => {
    if (!inviteForm.name || !inviteForm.email) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('create_editor_invitation', {
        editor_email: inviteForm.email,
        editor_name: inviteForm.name
      });

      if (error) throw error;

      // Store the invitation result to show the URL
      setInvitationResult({
        success: true,
        invitation_url: data.invitation_url,
        email: inviteForm.email,
        name: inviteForm.name
      });

      toast.success('Editor invitation created successfully!');
      setInviteForm({ name: '', email: '' });
      fetchEditorInvitations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "In Progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case "New":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">New</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Use dashboardData when available (feature flag is ON), otherwise use mock data
  // This allows a gradual transition without breaking the UI
  const displayData = {
    manuscripts: USE_SUPABASE_DATA && dashboardData ? 
      dashboardData.manuscripts.map(m => ({
        id: m.id,
        title: m.title,
        author: m.profiles?.name || 'Unknown Author',
        editor: "To be determined", // Would need joined data from assignments
        status: m.status,
        submitted: new Date(m.submission_date).toLocaleDateString(),
        deadline: m.deadline ? new Date(m.deadline).toLocaleDateString() : 'Not set'
      })) : 
      recentManuscripts,
    
    editorStats: USE_SUPABASE_DATA && dashboardData ? 
      dashboardData.editorMetrics.map(e => ({
        id: e.id,
        name: e.profiles?.name || 'Unknown Editor',
        assigned: e.assigned_count,
        completed: e.completed_count,
        satisfaction: e.satisfaction_rating,
        onTime: `${(e.on_time_rate * 100).toFixed(0)}%`
      })) : 
      editorPerformance,
    
    metrics: USE_SUPABASE_DATA && dashboardData && dashboardData.metrics ? 
      dashboardData.metrics : 
      {
        active_manuscripts: 24,
        active_editors: 8,
        completed_manuscripts: 18,
        avg_completion_days: 6.2,
        new_writers: 32,
        revenue: 8240,
        editor_capacity: 0.78,
        satisfaction_score: 4.8
      },
    
    history: USE_SUPABASE_DATA && dashboardData ?
      dashboardData.history :
      [
        { metric_name: 'active_manuscripts', change_percent: 12 },
        { metric_name: 'active_editors', change_percent: 25 },
        { metric_name: 'revenue', change_percent: 12 },
        { metric_name: 'satisfaction', change_percent: 4.2 }
      ]
  };

  // If loading with real data and still loading, show loading state
  if (USE_SUPABASE_DATA && isLoading) {
    return (
      <DashboardLayout allowedRoles={["publisher"]}>
        <div className="animate-fade-in">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Oversee platform performance and manage resources</p>
            </div>
          </div>
          
          {/* Skeleton loading UI for metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="gradient-card animate-pulse">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-200 w-12 h-12 rounded-full mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Skeleton loading UI for tables */}
          <Card className="mb-6">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-72"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-72"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // If error with real data, show error
  if (USE_SUPABASE_DATA && error) {
    return (
      <DashboardLayout allowedRoles={["publisher"]}>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <p className="text-lg text-red-500">Error loading dashboard data</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Get the change percentage for a specific metric
  const getChangePercent = (metricName) => {
    const metric = displayData.history.find(m => m.metric_name === metricName);
    return metric ? metric.change_percent : 0;
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout allowedRoles={["publisher"]}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== 'publisher') {
    return (
      <DashboardLayout allowedRoles={["publisher"]}>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Access denied. Publisher role required.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={["publisher"]}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Oversee platform performance and manage resources</p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="this-month" onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button className="gap-2 bg-admin-primary hover:bg-admin-accent">
              <Calendar size={16} />
              <span>Generate Report</span>
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="gradient-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="bg-admin-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-3">
                  <BookOpen className="text-admin-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-2xl">{displayData.metrics.active_manuscripts}</h3>
                  <span className="text-success text-sm flex items-center">
                    <TrendingUp size={14} />
                    <span>+{getChangePercent('active_manuscripts')}%</span>
                  </span>
                </div>
                <p className="text-muted-foreground">Active Manuscripts</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="bg-admin-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-3">
                  <Users className="text-admin-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-2xl">{displayData.metrics.active_editors}</h3>
                  <span className="text-success text-sm flex items-center">
                    <TrendingUp size={14} />
                    <span>+{getChangePercent('active_editors')}%</span>
                  </span>
                </div>
                <p className="text-muted-foreground">Active Editors</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="bg-admin-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-3">
                  <CheckCircle className="text-admin-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-2xl">{displayData.metrics.completed_manuscripts}</h3>
                  <span className="text-success text-sm flex items-center">
                    <TrendingUp size={14} />
                    <span>+33%</span>
                  </span>
                </div>
                <p className="text-muted-foreground">Completed This Month</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="bg-admin-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-3">
                  <Clock className="text-admin-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-2xl">{displayData.metrics.avg_completion_days}</h3>
                  <span className="text-destructive text-sm flex items-center">
                    <TrendingDown size={14} />
                    <span>+0.5</span>
                  </span>
                </div>
                <p className="text-muted-foreground">Avg. Days to Complete</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Manuscripts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Manuscripts</CardTitle>
              <CardDescription>
                Latest script submissions and their current status
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/manuscripts">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Assigned Editor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.manuscripts.slice(0, 4).map((manuscript) => (
                  <TableRow key={manuscript.id}>
                    <TableCell className="font-medium">{manuscript.title}</TableCell>
                    <TableCell>{manuscript.author}</TableCell>
                    <TableCell>{manuscript.editor}</TableCell>
                    <TableCell>{getStatusBadge(manuscript.status)}</TableCell>
                    <TableCell>{manuscript.submitted}</TableCell>
                    <TableCell>{manuscript.deadline}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/manuscripts/${manuscript.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Editor Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Editor Performance</CardTitle>
              <CardDescription>
                Current workload and performance metrics for active editors
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/editors">Manage Editors</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Editor</TableHead>
                  <TableHead>Assigned Scripts</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Satisfaction Rating</TableHead>
                  <TableHead>On-time Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.editorStats.map((editor) => (
                  <TableRow key={editor.id}>
                    <TableCell className="font-medium">{editor.name}</TableCell>
                    <TableCell>{editor.assigned}</TableCell>
                    <TableCell>{editor.completed}</TableCell>
                    <TableCell>
                      <span className="text-amber-500">★</span> {editor.satisfaction}
                    </TableCell>
                    <TableCell>{editor.onTime}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/editors/${editor.id}`}>Details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>
              Key metrics showing platform growth and efficiency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">New Writers</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-semibold">{displayData.metrics.new_writers}</h3>
                  <span className="text-success text-sm flex items-center">
                    <TrendingUp size={14} />
                    <span>+18%</span>
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Revenue</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-semibold">${displayData.metrics.revenue}</h3>
                  <span className="text-success text-sm flex items-center">
                    <TrendingUp size={14} />
                    <span>+{getChangePercent('revenue')}%</span>
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Editor Capacity</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-semibold">{Math.round(displayData.metrics.editor_capacity * 100)}%</h3>
                  <span className="text-amber-500 text-sm flex items-center">
                    <TrendingUp size={14} />
                    <span>+5%</span>
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Satisfaction Score</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-semibold">{displayData.metrics.satisfaction_score}</h3>
                  <span className="text-success text-sm flex items-center">
                    <TrendingUp size={14} />
                    <span>+{getChangePercent('satisfaction')}%</span>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button className="gap-2 bg-admin-primary hover:bg-admin-accent">
              <BarChart size={16} />
              <span>View Full Analytics</span>
            </Button>
          </CardFooter>
        </Card>

        {/* Editor Management Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Editor Invitations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Editor Invitations</CardTitle>
                  <CardDescription>Manage editor invitations and onboarding</CardDescription>
                </div>
                <Dialog open={showInviteDialog} onOpenChange={(open) => {
                  setShowInviteDialog(open);
                  if (!open) {
                    setInvitationResult(null);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Editor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {invitationResult ? 'Invitation Created!' : 'Invite New Editor'}
                      </DialogTitle>
                      <DialogDescription>
                        {invitationResult 
                          ? 'Share the invitation link below with the editor'
                          : 'Create an invitation for a new editor to join the platform'
                        }
                      </DialogDescription>
                    </DialogHeader>
                    
                    {!invitationResult ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={inviteForm.name}
                            onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                            placeholder="Editor's full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                            placeholder="editor@example.com"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-800">
                              Invitation created for {invitationResult.name}
                            </span>
                          </div>
                          <p className="text-sm text-green-700">
                            Email: {invitationResult.email}
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="invitation-url">Invitation Link</Label>
                          <div className="flex space-x-2 mt-1">
                            <Input
                              id="invitation-url"
                              value={invitationResult.invitation_url}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(invitationResult.invitation_url);
                                toast.success('Invitation link copied to clipboard!');
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Send this link to the editor. They can use it to create their account and set their password.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Next steps:</span>
                            <br />
                            1. Copy the invitation link above
                            <br />
                            2. Send it to {invitationResult.name} via email or message
                            <br />
                            3. They will click the link and set up their account
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm font-medium text-gray-800 mb-2">Sample Email Template:</p>
                          <div className="text-xs text-gray-700 space-y-1">
                            <p><span className="font-medium">Subject:</span> Invitation to join Mystery Publishers as an Editor</p>
                            <div className="mt-2 p-2 bg-white rounded border text-xs">
                              <p>Hi {invitationResult.name},</p>
                              <br />
                              <p>You've been invited to join Mystery Publishers as an editor. Click the link below to create your account and set your password:</p>
                              <br />
                              <p className="font-mono text-blue-600">{invitationResult.invitation_url}</p>
                              <br />
                              <p>This invitation expires in 7 days.</p>
                              <br />
                              <p>Best regards,<br />Mystery Publishers Team</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <DialogFooter>
                      {!invitationResult ? (
                        <>
                          <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleInviteEditor} disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Invitation'}
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setShowInviteDialog(false)}>
                          Done
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {editorInvitations.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No pending invitations</p>
                ) : (
                  editorInvitations.slice(0, 5).map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(invitation.status)}
                        <div>
                          <p className="font-medium text-sm">{invitation.name}</p>
                          <p className="text-xs text-muted-foreground">{invitation.email}</p>
                        </div>
                      </div>
                      <Badge variant={invitation.status === 'accepted' ? 'default' : 'secondary'}>
                        {invitation.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Editors */}
          <Card>
            <CardHeader>
              <CardTitle>Active Editors</CardTitle>
              <CardDescription>Current editors on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {editors.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No editors yet</p>
                ) : (
                  editors.slice(0, 5).map((editor) => (
                    <div key={editor.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{editor.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {editor.total_manuscripts_edited} manuscripts • {editor.average_rating}★ rating
                        </p>
                      </div>
                      <Badge variant={editor.availability_status === 'available' ? 'default' : 'secondary'}>
                        {editor.availability_status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
