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
import { DollarSign } from "lucide-react";

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

const sampleManuscripts: Manuscript[] = [
  {
    id: "m1",
    title: "The Haunting of Elmwood Manor",
    synopsis: "A gothic tale of mystery and suspense in an old New England mansion.",
    genre: "Mystery",
    wordCount: 85000,
    price: 2500,
    dateAdded: "2025-04-15",
    status: "listed",
    offers: [
      {
        id: "o1",
        publisherId: "p1",
        publisherName: "Moonlight Publishing",
        amount: 2300,
        message: "We're interested in your gothic mystery. We specialize in this genre and believe our audience would love it.",
        date: "2025-05-01"
      }
    ]
  },
  {
    id: "m2",
    title: "Whispers in the Wind",
    synopsis: "A contemporary romance set in a coastal town.",
    genre: "Romance",
    wordCount: 72000,
    price: 1800,
    dateAdded: "2025-05-01",
    status: "draft",
    offers: []
  }
];

const WriterMarketplace: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [manuscripts, setManuscripts] = useState<Manuscript[]>(sampleManuscripts);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newManuscript, setNewManuscript] = useState({
    title: "",
    synopsis: "",
    genre: "",
    wordCount: 0,
    price: 0
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const manuscript: Manuscript = {
      id: `m${Date.now()}`,
      title: newManuscript.title,
      synopsis: newManuscript.synopsis,
      genre: newManuscript.genre,
      wordCount: newManuscript.wordCount,
      price: newManuscript.price,
      dateAdded: new Date().toISOString().split("T")[0],
      status: "draft",
      offers: []
    };
    
    setManuscripts([...manuscripts, manuscript]);
    setShowNewForm(false);
    setNewManuscript({ title: "", synopsis: "", genre: "", wordCount: 0, price: 0 });
    
    toast({
      title: "Manuscript Added",
      description: "Your manuscript has been added to your portfolio."
    });
  };

  const handleStatusChange = (id: string, status: "draft" | "listed" | "sold") => {
    setManuscripts(manuscripts.map(m => 
      m.id === id ? { ...m, status } : m
    ));
    
    toast({
      title: "Status Updated",
      description: `The manuscript status has been changed to ${status}.`
    });
  };

  const acceptOffer = (manuscriptId: string, offerId: string) => {
    setManuscripts(manuscripts.map(m => 
      m.id === manuscriptId ? { ...m, status: "sold" } : m
    ));
    
    toast({
      title: "Offer Accepted",
      description: "Congratulations! You have accepted the publisher's offer."
    });
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
