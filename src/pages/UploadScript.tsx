import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Check, 
  FileText,
  Upload,
  X,
  AlertCircle
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
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [docsLink, setDocsLink] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState("");
  const [deadline, setDeadline] = useState("");
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (allowedTypes.includes(selectedFile.type)) {
        setManuscriptFile(selectedFile);
        toast.success("File selected successfully");
      } else {
        toast.error("Please upload a PDF, DOC, DOCX, or TXT file");
      }
    }
  };
  
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

  const handleRemoveFile = () => {
    setManuscriptFile(null);
  };

  const validateGoogleDocsLink = (link: string) => {
    return link.includes("docs.google.com") || link.includes("drive.google.com");
  };

  const uploadFile = async (file: File, bucket: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to upload scripts");
      return;
    }
    
    // Validation
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    if (!genre) {
      toast.error("Genre is required");
      return;
    }

    if (!manuscriptFile && !docsLink.trim()) {
      toast.error("Please either upload a file or provide a Google Docs link");
      return;
    }

    if (docsLink.trim() && !validateGoogleDocsLink(docsLink)) {
      toast.error("Please provide a valid Google Docs or Google Drive link");
      return;
    }

    if (wordCount && isNaN(parseInt(wordCount))) {
      toast.error("Word count must be a number");
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      let fileUrl = null;
      let coverUrl = null;
      
      // Upload manuscript file if provided
      if (manuscriptFile) {
        setUploadProgress(20);
        const fileName = `manuscripts/${user.id}/${Date.now()}-${manuscriptFile.name}`;
        fileUrl = await uploadFile(manuscriptFile, 'manuscripts', fileName);
        setUploadProgress(40);
      }
      
      // Upload cover image if provided
      if (coverImage) {
        setUploadProgress(60);
        const coverFileName = `covers/${user.id}/${Date.now()}-${coverImage.name}`;
        coverUrl = await uploadFile(coverImage, 'covers', coverFileName);
        setUploadProgress(70);
      }
      
      setUploadProgress(80);
      
      // Prepare manuscript data
      const manuscriptData = {
        title: title.trim(),
        genre: genre,
        author_id: user.id,
        status: 'submitted',
        word_count: parseInt(wordCount) || 0,
        submission_date: new Date().toISOString(),
        deadline: deadline ? new Date(deadline).toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Additional fields for tracking
        file_url: fileUrl,
        cover_url: coverUrl,
        google_docs_link: docsLink.trim() || null,
        description: description.trim() || null
      };

      console.log('Submitting manuscript:', manuscriptData);

      // Save to Supabase
      const { data, error } = await supabase
        .from('manuscripts')
        .insert([manuscriptData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        
        // Provide specific error messages
        if (error.code === 'PGRST116') {
          toast.error("Database configuration error. Please contact support.");
        } else if (error.message.includes('violates row-level security')) {
          toast.error("Permission denied. Please ensure you're logged in properly.");
        } else if (error.message.includes('not-null')) {
          toast.error("Missing required field. Please fill in all required information.");
        } else {
          toast.error(`Upload failed: ${error.message}`);
        }
        return;
      }

      console.log('Manuscript uploaded successfully:', data);

      setUploadProgress(100);
      
      toast.success("Script uploaded successfully!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setGenre("");
      setDocsLink("");
      setManuscriptFile(null);
      setCoverImage(null);
      setCoverPreview(null);
      setWordCount("");
      setDeadline("");
      
      // Redirect to My Scripts page after a short delay
      setTimeout(() => {
        window.location.href = '/my-scripts';
      }, 1500);
      
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      if (error.message?.includes('storage')) {
        toast.error("File upload failed. Please check your file size and format.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <DashboardLayout role={user?.role || "writer"}>
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
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <SelectItem value="romance">Romance</SelectItem>
                      <SelectItem value="mystery">Mystery</SelectItem>
                      <SelectItem value="thriller">Thriller</SelectItem>
                      <SelectItem value="horror">Horror</SelectItem>
                      <SelectItem value="biography">Biography</SelectItem>
                      <SelectItem value="memoir">Memoir</SelectItem>
                      <SelectItem value="self-help">Self-Help</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="wordCount">Word Count</Label>
                  <Input 
                    id="wordCount" 
                    type="number"
                    placeholder="Approximate word count" 
                    value={wordCount}
                    onChange={(e) => setWordCount(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="deadline">Preferred Deadline (Optional)</Label>
                <Input 
                  id="deadline" 
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Method</CardTitle>
              <CardDescription>
                Choose how to submit your manuscript
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload File (PDF, DOC, DOCX, TXT)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  {manuscriptFile ? (
                    <div className="space-y-2">
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">{manuscriptFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(manuscriptFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="mt-2"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PDF, DOC, DOCX or TXT files</p>
                      </div>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Select File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                OR
              </div>

              <div className="space-y-1">
                <Label htmlFor="docs-link">Google Docs/Drive Link</Label>
                <Input 
                  id="docs-link" 
                  placeholder="https://docs.google.com/document/d/..." 
                  value={docsLink}
                  onChange={(e) => setDocsLink(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Make sure the document is shared with view access
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover Image (Optional)</CardTitle>
              <CardDescription>
                Upload a cover image for your manuscript
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coverPreview ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img 
                      src={coverPreview} 
                      alt="Cover preview" 
                      className="max-w-48 max-h-64 rounded-lg shadow-md object-cover"
                    />
                  </div>
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveCover}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove Cover
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <div className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Upload cover image</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, or GIF</p>
                    </div>
                    <Input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="sr-only"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('cover-upload')?.click()}
                    >
                      Select Image
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isUploading && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isUploading} className="px-8">
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Manuscript
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default UploadScript;
