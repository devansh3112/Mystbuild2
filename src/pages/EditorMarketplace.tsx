import React, { useState } from "react";
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

interface EditorAssignment {
  id: string;
  manuscriptId: string;
  title: string;
  synopsis: string;
  publisher: {
    id: string;
    name: string;
  };
  genre: string;
  wordCount: number;
  chapters: number;
  fee: number;
  deadline: string;
  status: "available" | "applied" | "assigned" | "completed";
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

const sampleAssignments: EditorAssignment[] = [
  {
    id: "ea1",
    manuscriptId: "m1",
    title: "Shadows in the Deep",
    synopsis: "A thriller set on a remote research vessel in the Arctic.",
    publisher: {
      id: "p1",
      name: "Horizon Publishing"
    },
    genre: "Thriller",
    wordCount: 78000,
    chapters: 22,
    fee: 1500,
    deadline: "2025-06-30",
    status: "available"
  },
  {
    id: "ea2",
    manuscriptId: "m2",
    title: "The Garden of Memories",
    synopsis: "A family saga spanning three generations.",
    publisher: {
      id: "p2",
      name: "Legacy Press"
    },
    genre: "Drama",
    wordCount: 92000,
    chapters: 28,
    fee: 1800,
    deadline: "2025-07-15",
    status: "applied"
  }
];

const myAssignments: MyAssignment[] = [
  {
    id: "ma1",
    manuscriptId: "m3",
    title: "Whispers of the Ancient Ones",
    publisher: {
      id: "p3",
      name: "Mystic Books"
    },
    genre: "Fantasy",
    wordCount: 105000,
    chapters: 30,
    fee: 2200,
    status: "in_progress",
    deadline: "2025-07-01",
    progress: 40,
    milestones: [
      {
        id: "mil1",
        name: "Initial Review",
        amount: 440,
        status: "paid"
      },
      {
        id: "mil2",
        name: "First Half Completion",
        amount: 880,
        status: "pending"
      },
      {
        id: "mil3",
        name: "Final Edit",
        amount: 880,
        status: "pending"
      }
    ]
  }
];

const EditorMarketplace: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<EditorAssignment[]>(sampleAssignments);
  const [myCurrentAssignments, setMyCurrentAssignments] = useState<MyAssignment[]>(myAssignments);
  const [selectedAssignment, setSelectedAssignment] = useState<EditorAssignment | null>(null);
  const [applicationMessage, setApplicationMessage] = useState<string>("");
  const [showApplicationDialog, setShowApplicationDialog] = useState<boolean>(false);

  const applyForAssignment = (assignment: EditorAssignment) => {
    setSelectedAssignment(assignment);
    setApplicationMessage("");
    setShowApplicationDialog(true);
  };

  const submitApplication = () => {
    setAssignments(assignments.map(a => 
      a.id === selectedAssignment?.id ? { ...a, status: "applied" } : a
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
                    <TableCell>{assignment.publisher.name}</TableCell>
                    <TableCell>{assignment.genre}</TableCell>
                    <TableCell>{assignment.wordCount}</TableCell>
                    <TableCell>${assignment.fee}</TableCell>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Applications</CardTitle>
            <CardDescription>Track your pending applications</CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.filter(a => a.status === "applied").length === 0 ? (
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
                    .filter(assignment => assignment.status === "applied")
                    .map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.title}</TableCell>
                      <TableCell>{assignment.publisher.name}</TableCell>
                      <TableCell>{assignment.genre}</TableCell>
                      <TableCell>${assignment.fee}</TableCell>
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
              Submit your application to edit "{selectedAssignment?.title}" for {selectedAssignment?.publisher.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Job Details</h4>
              <ul className="text-sm space-y-1">
                <li><span className="font-medium">Genre:</span> {selectedAssignment?.genre}</li>
                <li><span className="font-medium">Word Count:</span> {selectedAssignment?.wordCount}</li>
                <li><span className="font-medium">Fee:</span> ${selectedAssignment?.fee}</li>
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
