
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Check, 
  FileText,
  Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const UploadScript: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [docsLink, setDocsLink] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [chapterCount, setChapterCount] = useState<number>(1);
  
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith("image/")) {
        setCoverImage(selectedFile);
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setCoverPreview(e.target.result as string);
          }
        };
        reader.readAsDataURL(selectedFile);
      } else {
        toast.error("Please upload an image file");
      }
    }
  };
  
  const handleRemoveCover = () => {
    setCoverImage(null);
    setCoverPreview(null);
  };

  const validateGoogleDocsLink = (link: string) => {
    // Basic validation for Google Docs link
    return link.includes("docs.google.com");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !genre || !docsLink) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!validateGoogleDocsLink(docsLink)) {
      toast.error("Please enter a valid Google Docs link");
      return;
    }
    
    if (chapterCount < 1) {
      toast.error("Number of chapters must be at least 1");
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast.success("Script uploaded successfully!");
    setIsUploading(false);
    setUploadProgress(0);
    
    // Reset form
    setTitle("");
    setDescription("");
    setGenre("");
    setDocsLink("");
    setCoverImage(null);
    setCoverPreview(null);
    setChapterCount(1);
  };

  return (
    <DashboardLayout role="writer">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Upload New Script</h1>
          <p className="text-muted-foreground mt-1">Submit your manuscript for editing and publication</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Script Details</CardTitle>
              <CardDescription>
                Provide basic information about your manuscript
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="Enter the title of your script" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Write a brief description or synopsis" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="genre">Genre <span className="text-destructive">*</span></Label>
                <Select value={genre} onValueChange={setGenre} required>
                  <SelectTrigger id="genre">
                    <SelectValue placeholder="Select a genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fiction">Fiction</SelectItem>
                    <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                    <SelectItem value="sci-fi">Science Fiction</SelectItem>
                    <SelectItem value="fantasy">Fantasy</SelectItem>
                    <SelectItem value="mystery">Mystery</SelectItem>
                    <SelectItem value="romance">Romance</SelectItem>
                    <SelectItem value="thriller">Thriller</SelectItem>
                    <SelectItem value="horror">Horror</SelectItem>
                    <SelectItem value="poetry">Poetry</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="chapterCount">Number of Chapters <span className="text-destructive">*</span></Label>
                <Input 
                  id="chapterCount" 
                  type="number" 
                  min="1"
                  placeholder="Enter the number of chapters" 
                  value={chapterCount}
                  onChange={(e) => setChapterCount(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Google Docs Link</CardTitle>
              <CardDescription>
                Provide the link to your manuscript on Google Docs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="docsLink">Google Docs Link <span className="text-destructive">*</span></Label>
                  <div className="flex relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      <LinkIcon size={16} />
                    </span>
                    <Input 
                      id="docsLink" 
                      className="pl-10"
                      placeholder="https://docs.google.com/document/d/..." 
                      value={docsLink}
                      onChange={(e) => setDocsLink(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Please make sure your Google Doc is shared with edit access to anyone with the link
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover Image (Optional)</CardTitle>
              <CardDescription>
                Add a cover image for your manuscript
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="w-32 h-44 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="text-muted-foreground" size={36} />
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cover-image">Upload cover image</Label>
                    <Input
                      id="cover-image"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended size: 1400 x 2100 pixels (JPG, PNG)
                    </p>
                  </div>
                  {coverImage && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveCover}
                      className="gap-2"
                    >
                      Remove Image
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submission</CardTitle>
              <CardDescription>
                Submit your manuscript for review and editing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="mb-2 text-sm">
                  By submitting this manuscript, you confirm that:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5 mb-4">
                  <li>You hold the necessary rights to this content</li>
                  <li>The manuscript does not contain plagiarized material</li>
                  <li>You agree to the platform's terms and conditions</li>
                </ul>
              </div>
              {isUploading && (
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading script...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
              >
                Save as Draft
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading} 
                className="gap-2 bg-writer-primary hover:bg-writer-accent"
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Submit Script</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default UploadScript;
