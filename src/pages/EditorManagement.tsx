import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserPlus, 
  Users, 
  Edit3, 
  Trash2, 
  Search, 
  Filter,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle,
  Mail,
  Phone
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEditorManagement } from "@/hooks/useEditorManagement";
import { toast } from "sonner";

const EditorManagement: React.FC = () => {
  const { user } = useAuth();
  const { 
    editors, 
    loading, 
    error, 
    createEditor, 
    updateEditor, 
    fetchEditors 
  } = useEditorManagement();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form state for creating/editing editors
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    specialties: [] as string[],
    hourly_rate: "",
    years_experience: "",
    max_concurrent_projects: "5",
    availability_status: "available"
  });

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchEditors();
  }, [fetchEditors]);

  const specialtyOptions = [
    "Developmental Editing",
    "Copy Editing",
    "Proofreading",
    "Fiction",
    "Non-Fiction",
    "Academic",
    "Technical Writing",
    "Creative Writing",
    "Screenplay",
    "Poetry"
  ];

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      bio: "",
      specialties: [],
      hourly_rate: "",
      years_experience: "",
      max_concurrent_projects: "5",
      availability_status: "available"
    });
  };

  const handleCreateEditor = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setCreating(true);
      
      const editorData = {
        ...formData,
        hourly_rate: parseFloat(formData.hourly_rate) || 0,
        years_experience: parseInt(formData.years_experience) || 0,
        max_concurrent_projects: parseInt(formData.max_concurrent_projects) || 5,
        skills: formData.specialties.map(specialty => ({
          name: specialty,
          level: 'intermediate',
          experience: parseInt(formData.years_experience) || 0
        }))
      };

      await createEditor(editorData);
      setShowCreateDialog(false);
      resetForm();
      toast.success("Editor profile created successfully!");
    } catch (error) {
      console.error("Error creating editor:", error);
      toast.error("Failed to create editor profile");
    } finally {
      setCreating(false);
    }
  };

  const handleEditEditor = (editor: any) => {
    setSelectedEditor(editor);
    setFormData({
      name: editor.name || "",
      email: editor.email || "",
      phone: editor.phone || "",
      bio: editor.bio || "",
      specialties: editor.specialties || [],
      hourly_rate: editor.hourly_rate?.toString() || "",
      years_experience: editor.years_experience?.toString() || "",
      max_concurrent_projects: editor.max_concurrent_projects?.toString() || "5",
      availability_status: editor.availability_status || "available"
    });
    setShowEditDialog(true);
  };

  const handleUpdateEditor = async () => {
    if (!selectedEditor || !formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setUpdating(true);
      
      const updates = {
        ...formData,
        hourly_rate: parseFloat(formData.hourly_rate) || 0,
        years_experience: parseInt(formData.years_experience) || 0,
        max_concurrent_projects: parseInt(formData.max_concurrent_projects) || 5
      };

      await updateEditor(selectedEditor.id, updates);
      setShowEditDialog(false);
      setSelectedEditor(null);
      resetForm();
      toast.success("Editor profile updated successfully!");
    } catch (error) {
      console.error("Error updating editor:", error);
      toast.error("Failed to update editor profile");
    } finally {
      setUpdating(false);
    }
  };

  const filteredEditors = editors.filter(editor => {
    const matchesSearch = editor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         editor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || editor.availability_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle size={12} className="mr-1" />
          Available
        </Badge>;
      case 'busy':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          <Clock size={12} className="mr-1" />
          Busy
        </Badge>;
      case 'unavailable':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">
          <AlertTriangle size={12} className="mr-1" />
          Unavailable
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (user?.role !== 'publisher') {
    return (
      <DashboardLayout role="publisher">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Access denied. Only publishers can manage editors.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="publisher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Editor Management</h1>
            <p className="text-muted-foreground">Create and manage your team of editors</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Editor
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search editors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Editors List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEditors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No editors found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search criteria"
                  : "Start building your team by adding your first editor"
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Your First Editor
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEditors.map((editor) => (
              <Card key={editor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{editor.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Mail className="h-3 w-3" />
                        {editor.email}
                      </CardDescription>
                    </div>
                    {getStatusBadge(editor.availability_status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {editor.specialties && editor.specialties.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-1">
                        {editor.specialties.slice(0, 3).map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {editor.specialties.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{editor.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Experience:</span>
                      <div className="font-medium">{editor.years_experience || 0} years</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rate:</span>
                      <div className="font-medium">₦{editor.hourly_rate || 0}/hr</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Capacity:</span>
                      <div className="font-medium">{editor.current_workload || 0}/{editor.max_concurrent_projects || 5} projects</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{editor.average_rating || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditEditor(editor)}
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Editor Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Editor Profile</DialogTitle>
              <DialogDescription>
                Add a new editor to your team. You can update these details later.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter editor's name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="editor@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+234 xxx xxx xxxx"
                  />
                </div>
                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate (₦)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                    placeholder="5000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="years_experience">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    value={formData.years_experience}
                    onChange={(e) => setFormData({...formData, years_experience: e.target.value})}
                    placeholder="5"
                  />
                </div>
                <div>
                  <Label htmlFor="max_projects">Max Concurrent Projects</Label>
                  <Input
                    id="max_projects"
                    type="number"
                    value={formData.max_concurrent_projects}
                    onChange={(e) => setFormData({...formData, max_concurrent_projects: e.target.value})}
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio/Description</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Brief description of editor's background and experience..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Specialties</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {specialtyOptions.map((specialty) => (
                    <label key={specialty} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(specialty)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              specialties: [...formData.specialties, specialty]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              specialties: formData.specialties.filter(s => s !== specialty)
                            });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateEditor}
                disabled={creating || !formData.name || !formData.email}
              >
                {creating ? "Creating..." : "Create Editor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Editor Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Editor Profile</DialogTitle>
              <DialogDescription>
                Update {selectedEditor?.name}'s profile information.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_name">Full Name *</Label>
                  <Input
                    id="edit_name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter editor's name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_email">Email Address *</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="editor@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit_phone">Phone Number</Label>
                  <Input
                    id="edit_phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+234 xxx xxx xxxx"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_hourly_rate">Hourly Rate (₦)</Label>
                  <Input
                    id="edit_hourly_rate"
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_status">Status</Label>
                  <Select 
                    value={formData.availability_status} 
                    onValueChange={(value) => setFormData({...formData, availability_status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_years_experience">Years of Experience</Label>
                  <Input
                    id="edit_years_experience"
                    type="number"
                    value={formData.years_experience}
                    onChange={(e) => setFormData({...formData, years_experience: e.target.value})}
                    placeholder="5"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_max_projects">Max Concurrent Projects</Label>
                  <Input
                    id="edit_max_projects"
                    type="number"
                    value={formData.max_concurrent_projects}
                    onChange={(e) => setFormData({...formData, max_concurrent_projects: e.target.value})}
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit_bio">Bio/Description</Label>
                <Textarea
                  id="edit_bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Brief description of editor's background and experience..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Specialties</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {specialtyOptions.map((specialty) => (
                    <label key={specialty} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(specialty)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              specialties: [...formData.specialties, specialty]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              specialties: formData.specialties.filter(s => s !== specialty)
                            });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateEditor}
                disabled={updating || !formData.name || !formData.email}
              >
                {updating ? "Updating..." : "Update Editor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default EditorManagement; 