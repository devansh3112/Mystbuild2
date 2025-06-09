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
import { toast } from "sonner";
import { DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Manuscript {
  id: string;
  title: string;
  synopsis: string;
  genre: string;
  wordCount: number;
  price: number;
  dateAdded: string;
  status: "draft" | "listed" | "sold";
  offers: Offer[];
}

interface Offer {
  id: string;
  publisherId: string;
  publisherName: string;
  amount: number;
  message: string;
  date: string;
}

const WriterMarketplace: React.FC = () => {
  const { user } = useAuth();

  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newManuscript, setNewManuscript] = useState({
    title: "",
    synopsis: "",
    genre: "",
    wordCount: 0,
    price: 0
  });

  // Load manuscripts from database
  useEffect(() => {
    const loadManuscripts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        console.log('Loading manuscripts for user:', user.id);
        
        // Fetch user's manuscripts from database
        const { data: manuscriptsData, error } = await supabase
          .from('manuscripts')
          .select('*')
          .eq('author_id', user.id)
          .order('created_at', { ascending: false });
        
        console.log('Manuscripts query result:', { data: manuscriptsData, error });
        
        if (error) {
          console.error('Error loading manuscripts:', error);
          toast({
            title: "Error",
            description: `Failed to load manuscripts: ${error.message}`,
            variant: "destructive"
          });
          setManuscripts([]);
          setLoading(false);
          return;
        }

        // Transform database format to component format
        const transformedManuscripts = (manuscriptsData || []).map(dbManuscript => ({
          id: dbManuscript.id,
          title: dbManuscript.title,
          synopsis: '', // No description field in database, using empty string
          genre: dbManuscript.genre,
          wordCount: dbManuscript.word_count || 0,
          price: 0, // No price field in database yet
          dateAdded: dbManuscript.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: dbManuscript.status || 'New',
          offers: []
        }));
        
        console.log('Transformed manuscripts:', transformedManuscripts);
        setManuscripts(transformedManuscripts);
        
      } catch (error) {
        console.error('Error loading manuscripts:', error);
        toast({
          title: "Error",
          description: `Failed to load manuscripts: ${error.message}`,
          variant: "destructive"
        });
        setManuscripts([]);
      } finally {
        setLoading(false);
      }
    };

    loadManuscripts();
  }, [user, toast]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', newManuscript);
    
    if (!user) {
      toast.error("You must be logged in to create manuscripts.");
      return;
    }

    // Validate required fields
    if (!newManuscript.title.trim()) {
      toast.error("Please enter a manuscript title.");
      return;
    }

    if (!newManuscript.genre) {
      toast.error("Please select a genre.");
      return;
    }

    try {
      const manuscriptToInsert = {
        title: newManuscript.title.trim(),
        genre: newManuscript.genre,
        word_count: newManuscript.wordCount,
        author_id: user.id,
        status: 'New',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Inserting manuscript:', manuscriptToInsert);
      
      // Save to database
      const { data: savedManuscript, error } = await supabase
        .from('manuscripts')
        .insert([manuscriptToInsert])
        .select()
        .single();

      console.log('Insert result:', { data: savedManuscript, error });

      if (error) {
        console.error('Error creating manuscript:', error);
        toast({
          title: "Error",
          description: `Failed to create manuscript: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!savedManuscript) {
        console.error('No manuscript returned from insert');
        toast.error("Failed to create manuscript: No data returned");
        return;
      }

      // Transform and add to local state
      const manuscript = {
        id: savedManuscript.id,
        title: savedManuscript.title,
        synopsis: '', // No description field in database
        genre: savedManuscript.genre,
        wordCount: savedManuscript.word_count || 0,
        price: 0, // No price field in database yet
        dateAdded: savedManuscript.created_at.split('T')[0],
        status: savedManuscript.status || 'New',
        offers: []
      };
      
      console.log('Transformed manuscript:', manuscript);
      
      setManuscripts([manuscript, ...manuscripts]);
      setShowNewForm(false);
      setNewManuscript({ title: "", synopsis: "", genre: "", wordCount: 0, price: 0 });
      
      toast.success("Your manuscript has been added to your portfolio.");
    } catch (error) {
      console.error('Error creating manuscript:', error);
      toast({
        title: "Error",
        description: `Failed to create manuscript: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (id: string, status: "draft" | "listed" | "sold") => {
    try {
      // Update in database (using the status column that exists)
      const { error } = await supabase
        .from('manuscripts')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating manuscript status:', error);
        toast({
          title: "Error",
          description: `Failed to update manuscript status: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      // Update local state
      setManuscripts(manuscripts.map(m => 
        m.id === id ? { ...m, status } : m
      ));
      
      toast({
        title: "Status Updated",
        description: `The manuscript status has been changed to ${status}.`
      });
    } catch (error) {
      console.error('Error updating manuscript status:', error);
      toast({
        title: "Error",
        description: `Failed to update manuscript status: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const acceptOffer = (manuscriptId: string, offerId: string) => {
    setManuscripts(manuscripts.map(m => 
      m.id === manuscriptId ? { ...m, status: "sold" } : m
    ));
    
    toast.success("Congratulations! You have accepted the publisher's offer."
    );
  };

  if (!user) return null;

  return (
    <DashboardLayout role="writer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-playfair">Writer Marketplace</h1>
            <p className="text-muted-foreground mt-1">List your manuscripts for sale to publishers</p>
          </div>
          <Button 
            onClick={() => setShowNewForm(!showNewForm)}
            className="bg-writer-primary hover:bg-writer-primary/90"
          >
            {showNewForm ? "Cancel" : "New Manuscript"}
          </Button>
        </div>

        {showNewForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Manuscript</CardTitle>
              <CardDescription>Fill in the details to list your manuscript</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      value={newManuscript.title}
                      onChange={(e) => setNewManuscript({...newManuscript, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Input 
                      id="genre" 
                      value={newManuscript.genre}
                      onChange={(e) => setNewManuscript({...newManuscript, genre: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wordCount">Word Count</Label>
                    <Input 
                      id="wordCount" 
                      type="number" 
                      value={newManuscript.wordCount || ""}
                      onChange={(e) => setNewManuscript({...newManuscript, wordCount: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      value={newManuscript.price || ""}
                      onChange={(e) => setNewManuscript({...newManuscript, price: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="synopsis">Synopsis</Label>
                  <Textarea 
                    id="synopsis" 
                    value={newManuscript.synopsis}
                    onChange={(e) => setNewManuscript({...newManuscript, synopsis: e.target.value})}
                    rows={4}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-writer-primary hover:bg-writer-primary/90">
                    Save Manuscript
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>My Manuscripts</CardTitle>
              <CardDescription>Manage your manuscripts and review offers</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-writer-primary"></div>
                  <span className="ml-2">Loading manuscripts...</span>
                </div>
              ) : manuscripts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No manuscripts yet.</p>
                  <Button 
                    onClick={() => setShowNewForm(true)}
                    className="bg-writer-primary hover:bg-writer-primary/90"
                  >
                    Create Your First Manuscript
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Genre</TableHead>
                      <TableHead>Word Count</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Offers</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manuscripts.map((manuscript) => (
                      <TableRow key={manuscript.id}>
                        <TableCell className="font-medium">{manuscript.title}</TableCell>
                        <TableCell>{manuscript.genre}</TableCell>
                        <TableCell>{manuscript.wordCount}</TableCell>
                        <TableCell>${manuscript.price}</TableCell>
                        <TableCell>
                          <Badge className={
                            manuscript.status === "draft" ? "bg-gray-500" :
                            manuscript.status === "listed" ? "bg-blue-500" :
                            "bg-green-500"
                          }>
                            {manuscript.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{manuscript.offers.length}</TableCell>
                        <TableCell className="text-right">
                          {manuscript.status === "draft" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusChange(manuscript.id, "listed")}
                            >
                              List for Sale
                            </Button>
                          )}
                          {manuscript.status === "listed" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusChange(manuscript.id, "draft")}
                            >
                              Unlist
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {manuscripts.some(m => m.offers.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Publisher Offers</CardTitle>
                <CardDescription>Review and respond to offers from publishers</CardDescription>
              </CardHeader>
              <CardContent>
                {manuscripts.map(manuscript => 
                  manuscript.offers.length > 0 && (
                    <div key={manuscript.id} className="mb-6 border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-2">
                        Offers for "{manuscript.title}"
                      </h3>
                      {manuscript.offers.map(offer => (
                        <div key={offer.id} className="border-l-4 border-writer-primary pl-4 mb-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{offer.publisherName}</p>
                              <p className="text-sm text-muted-foreground">
                                Offered on {new Date(offer.date).toLocaleDateString()}
                              </p>
                              <p className="mt-2">{offer.message}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold flex items-center">
                                <DollarSign size={18} className="mr-1" />
                                {offer.amount}
                              </p>
                              {manuscript.status !== "sold" && (
                                <Button 
                                  size="sm" 
                                  className="mt-2 bg-writer-primary hover:bg-writer-primary/90"
                                  onClick={() => acceptOffer(manuscript.id, offer.id)}
                                >
                                  Accept Offer
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WriterMarketplace;
