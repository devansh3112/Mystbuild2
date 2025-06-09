import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DollarSign, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditorAssignment {
  id: string;
  title: string;
  author: string;
  genre: string;
  wordCount: number;
  deadline: string;
  rate: number;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "available" | "claimed" | "in_progress" | "completed";
  description: string;
  requirements: string[];
}

interface MyAssignment {
  id: string;
  manuscriptId: string;
  title: string;
  publisher: {
    id: string;
    name: string;
  };
  genre: string;
  wordCount: number;
  chapters: number;
  fee: number;
  status: "in_progress" | "completed" | "paid";
  deadline: string;
  progress: number;
  milestones: {
    id: string;
    name: string;
    amount: number;
    status: "pending" | "completed" | "paid";
  }[];
}

const EditorMarketplace: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<EditorAssignment[]>([]);
  const [myCurrentAssignments, setMyCurrentAssignments] = useState<MyAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<EditorAssignment | null>(null);
  const [applicationMessage, setApplicationMessage] = useState<string>("");
  const [showApplicationDialog, setShowApplicationDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  useEffect(() => {
    const loadAssignments = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // TODO: Replace with actual API call to fetch available assignments
        // const response = await supabase
        //   .from('assignments')
        //   .select('*')
        //   .eq('status', 'available');
        
        // For now, start with empty array
        setAssignments([]);
      } catch (error) {
        console.error('Error loading assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, [user]);

  const applyForAssignment = (assignment: EditorAssignment) => {
    setSelectedAssignment(assignment);
    setApplicationMessage("");
    setShowApplicationDialog(true);
  };

  const submitApplication = () => {
    setAssignments(assignments.map(a => 
      a.id === selectedAssignment?.id ? { ...a, status: "claimed" } : a
    ));
    
    toast({
      title: "Application Submitted",
      description: `You've applied to edit "${selectedAssignment?.title}".`
    });
    
    setShowApplicationDialog(false);
  };

  const requestMilestonePayment = (assignmentId: string, milestoneId: string) => {
    setMyCurrentAssignments(myCurrentAssignments.map(assignment => 
      assignment.id === assignmentId 
        ? {
            ...assignment,
            milestones: assignment.milestones.map(milestone => 
              milestone.id === milestoneId 
                ? { ...milestone, status: "completed" } 
                : milestone
            )
          }
        : assignment
    ));
    
    toast({
      title: "Payment Requested",
      description: "You've requested payment for this milestone."
    });
  };

  if (!user) return null;

  return (
    <DashboardLayout role="editor">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-playfair">Editor Marketplace</h1>
          <p className="text-muted-foreground mt-1">Find editing opportunities and manage your assignments</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Assignments</CardTitle>
            <CardDescription>Browse manuscripts that need editors</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-editor-primary"></div>
                <span className="ml-2">Loading assignments...</span>
              </div>
            ) : assignments.filter(a => a.status === "available").length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No assignments available</h3>
                <p className="text-muted-foreground">
                  Check back later for new editing opportunities.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Publisher</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Word Count</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments
                    .filter(assignment => assignment.status === "available")
                    .map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.title}</TableCell>
                      <TableCell>{assignment.author}</TableCell>
                      <TableCell>{assignment.genre}</TableCell>
                      <TableCell>{assignment.wordCount}</TableCell>
                      <TableCell>${assignment.rate}</TableCell>
                      <TableCell>{new Date(assignment.deadline).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => applyForAssignment(assignment)}
                        >
                          Apply
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Applications</CardTitle>
            <CardDescription>Track your pending applications</CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.filter(a => a.status === "claimed").length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">You haven't applied for any assignments yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Publisher</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments
                    .filter(assignment => assignment.status === "claimed")
                    .map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.title}</TableCell>
                      <TableCell>{assignment.author}</TableCell>
                      <TableCell>{assignment.genre}</TableCell>
                      <TableCell>${assignment.rate}</TableCell>
                      <TableCell>
                        <Badge className="bg-amber-500">Pending</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Assignments</CardTitle>
            <CardDescription>Manage your ongoing work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {myCurrentAssignments.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">You don't have any current assignments.</p>
            ) : (
              myCurrentAssignments.map(assignment => (
                <div key={assignment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {assignment.publisher.name} · {assignment.genre} · {assignment.wordCount} words
                      </p>
                    </div>
                    <Badge className={
                      assignment.status === "in_progress" ? "bg-blue-500" :
                      assignment.status === "completed" ? "bg-green-500" :
                      "bg-purple-500"
                    }>
                      {assignment.status.replace("_", " ")}
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span>Progress: {assignment.progress}%</span>
                      <span>Deadline: {new Date(assignment.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-editor-primary rounded-full" 
                        style={{ width: `${assignment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Milestones</h4>
                    <div className="space-y-2">
                      {assignment.milestones.map(milestone => (
                        <div key={milestone.id} className="flex justify-between items-center p-2 border rounded">
                          <div className="flex items-center">
                            <FileText size={16} className="mr-2" />
                            <span>{milestone.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium">${milestone.amount}</span>
                            {milestone.status === "pending" ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => requestMilestonePayment(assignment.id, milestone.id)}
                              >
                                Request Payment
                              </Button>
                            ) : milestone.status === "completed" ? (
                              <Badge className="bg-amber-500">Payment Requested</Badge>
                            ) : (
                              <Badge className="bg-green-500">Paid</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for Editing Assignment</DialogTitle>
            <DialogDescription>
              Submit your application to edit "{selectedAssignment?.title}" for {selectedAssignment?.author}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Job Details</h4>
              <ul className="text-sm space-y-1">
                <li><span className="font-medium">Genre:</span> {selectedAssignment?.genre}</li>
                <li><span className="font-medium">Word Count:</span> {selectedAssignment?.wordCount}</li>
                <li><span className="font-medium">Fee:</span> ${selectedAssignment?.rate}</li>
                <li><span className="font-medium">Deadline:</span> {selectedAssignment?.deadline && new Date(selectedAssignment.deadline).toLocaleDateString()}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Your Cover Letter</Label>
              <Textarea 
                id="message" 
                placeholder="Tell the publisher about your qualifications and why you're a good fit for this project..."
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplicationDialog(false)}>Cancel</Button>
            <Button onClick={submitApplication} className="bg-editor-primary hover:bg-editor-primary/90">
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EditorMarketplace;
