
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BookOpen, FileText, Check, Clock, AlertCircle } from "lucide-react";

// Sample data for the scripts page
const myScripts = [
  {
    id: 1,
    title: "The Lost Chapter",
    status: "In Review",
    genre: "Mystery",
    coverUrl: null,
    dateSubmitted: "2023-10-15",
    chapters: [
      { number: 1, title: "The Beginning", status: "completed" },
      { number: 2, title: "The Discovery", status: "completed" },
      { number: 3, title: "The Mystery Deepens", status: "in-progress" },
      { number: 4, title: "The Revelation", status: "pending" },
      { number: 5, title: "The Conclusion", status: "pending" }
    ]
  },
  {
    id: 2,
    title: "Midnight Dreams",
    status: "Editing",
    genre: "Fantasy",
    coverUrl: null,
    dateSubmitted: "2023-09-28",
    chapters: [
      { number: 1, title: "Dream World", status: "completed" },
      { number: 2, title: "The Nightmare", status: "completed" },
      { number: 3, title: "Lucid Dreaming", status: "in-progress" }
    ]
  },
  {
    id: 3,
    title: "Shadows of Tomorrow",
    status: "Published",
    genre: "Sci-Fi",
    coverUrl: null,
    dateSubmitted: "2023-08-05",
    chapters: [
      { number: 1, title: "Future Past", status: "completed" },
      { number: 2, title: "The Machine", status: "completed" },
      { number: 3, title: "Time Paradox", status: "completed" },
      { number: 4, title: "The Final Timeline", status: "completed" }
    ]
  }
];

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
  const completed = chapters.filter(c => c.status === "completed").length;
  return (completed / chapters.length) * 100;
};

const ScriptCard = ({ script }: { script: typeof myScripts[0] }) => {
  const progress = calculateProgress(script.chapters);
  
  return (
    <Card className="hover:border-writer-primary/30 transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-playfair">{script.title}</CardTitle>
            <div className="flex gap-2 mt-1">
              <Badge variant={script.status === "Published" ? "default" : "outline"} className="font-inter">
                {script.status}
              </Badge>
              <CardDescription>{script.genre} • {script.dateSubmitted}</CardDescription>
            </div>
          </div>
          <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
            <BookOpen size={24} className="text-writer-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Chapters ({script.chapters.length})</h4>
            <div className="space-y-1.5">
              {script.chapters.map((chapter) => (
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
        </div>
      </CardContent>
    </Card>
  );
};

const MyScripts: React.FC = () => {
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

        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All Scripts</TabsTrigger>
              <TabsTrigger value="in-review">In Review</TabsTrigger>
              <TabsTrigger value="editing">Editing</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FileText size={16} className="mr-2" />
                Export List
              </Button>
            </div>
          </div>
          
          <TabsContent value="all" className="space-y-4">
            {myScripts.map((script) => (
              <ScriptCard key={script.id} script={script} />
            ))}
          </TabsContent>
          
          <TabsContent value="in-review" className="space-y-4">
            {myScripts.filter(s => s.status === "In Review").map((script) => (
              <ScriptCard key={script.id} script={script} />
            ))}
          </TabsContent>
          
          <TabsContent value="editing" className="space-y-4">
            {myScripts.filter(s => s.status === "Editing").map((script) => (
              <ScriptCard key={script.id} script={script} />
            ))}
          </TabsContent>
          
          <TabsContent value="published" className="space-y-4">
            {myScripts.filter(s => s.status === "Published").map((script) => (
              <ScriptCard key={script.id} script={script} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MyScripts;
