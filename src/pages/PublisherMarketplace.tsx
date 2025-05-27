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
import { DollarSign, Users } from "lucide-react";

interface Manuscript {
  id: string;
  writerId: string;
  writerName: string;
  title: string;
  synopsis: string;
  genre: string;
  wordCount: number;
  askingPrice: number;
  dateAdded: string;
}

interface OwnedManuscript {
  id: string;
  writerId: string;
  writerName: string;
  title: string;
  synopsis: string;
  genre: string;
  wordCount: number;
  purchasePrice: number;
  dateAcquired: string;
  status: "acquired" | "editing" | "completed";
  editorAssigned?: {
    id: string;
    name: string;
    fee: number;
  };
  editorOffers: EditorOffer[];
}

interface EditorOffer {
  id: string;
  editorId: string;
  editorName: string;
  fee: number;
  message: string;
  date: string;
}

const sampleMarketplace: Manuscript[] = [
  {
    id: "m1",
    writerId: "w1",
    writerName: "Sarah Johnson",
    title: "The Haunting of Elmwood Manor",
    synopsis: "A gothic tale of mystery and suspense in an old New England mansion.",
    genre: "Mystery",
    wordCount: 85000,
    askingPrice: 2500,
    dateAdded: "2025-04-15"
  },
  {
    id: "m3",
    writerId: "w3",
    writerName: "James Liu",
    title: "Echoes of Yesterday",
    synopsis: "A historical fiction set during the 1920s jazz age.",
    genre: "Historical Fiction",
    wordCount: 95000,
    askingPrice: 3200,
    dateAdded: "2025-05-10"
  }
];

const sampleOwnedManuscripts: OwnedManuscript[] = [
  {
    id: "om1",
    writerId: "w2",
    writerName: "Alex Rivera",
    title: "Shadows in the Deep",
    synopsis: "A thriller set on a remote research vessel in the Arctic.",
    genre: "Thriller",
    wordCount: 78000,
    purchasePrice: 2800,
    dateAcquired: "2025-04-01",
    status: "acquired",
    editorOffers: [
      {
        id: "eo1",
        editorId: "e1",
        editorName: "Mark Davis",
        fee: 1200,
        message: "I specialize in thrillers and have edited three bestsellers in this genre.",
        date: "2025-05-12"
      }
    ]
  }
];

const PublisherMarketplace: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [marketplace, setMarketplace] = useState<Manuscript[]>(sampleMarketplace);
  const [ownedManuscripts, setOwnedManuscripts] = useState<OwnedManuscript[]>(sampleOwnedManuscripts);
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [offerMessage, setOfferMessage] = useState<string>("");
  const [showOfferDialog, setShowOfferDialog] = useState<boolean>(false);

  const makeOffer = (manuscript: Manuscript) => {
    setSelectedManuscript(manuscript);
    setOfferAmount(manuscript.askingPrice);
    setOfferMessage("");
    setShowOfferDialog(true);
  };

  const submitOffer = () => {
    toast({
      title: "Offer Submitted",
      description: `You've made an offer on "${selectedManuscript?.title}".`
    });
    setShowOfferDialog(false);
  };

  const acceptEditorOffer = (manuscriptId: string, offer: EditorOffer) => {
    setOwnedManuscripts(ownedManuscripts.map(m => 
      m.id === manuscriptId 
        ? { 
            ...m, 
            status: "editing", 
            editorAssigned: {
              id: offer.editorId,
              name: offer.editorName,
              fee: offer.fee
            },
            editorOffers: [] 
          } 
        : m
    ));
    
    toast({
      title: "Editor Assigned",
      description: `${offer.editorName} has been assigned to edit "${
        ownedManuscripts.find(m => m.id === manuscriptId)?.title
      }".`
    });
  };

  const listForEditing = (manuscriptId: string) => {
    toast({
      title: "Manuscript Listed",
      description: "Your manuscript is now listed for editors to apply."
    });
  };

  if (!user) return null;

  return (
    <DashboardLayout role="publisher">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-playfair">Publisher Marketplace</h1>
          <p className="text-muted-foreground mt-1">Find manuscripts and assign editors</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Manuscripts</CardTitle>
            <CardDescription>Browse manuscripts from writers</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Word Count</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Date Listed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketplace.map((manuscript) => (
                  <TableRow key={manuscript.id}>
                    <TableCell className="font-medium">{manuscript.title}</TableCell>
                    <TableCell>{manuscript.writerName}</TableCell>
                    <TableCell>{manuscript.genre}</TableCell>
                    <TableCell>{manuscript.wordCount}</TableCell>
                    <TableCell>${manuscript.askingPrice}</TableCell>
                    <TableCell>{new Date(manuscript.dateAdded).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => makeOffer(manuscript)}
                      >
                        Make Offer
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
            <CardTitle>My Acquisitions</CardTitle>
            <CardDescription>Manage manuscripts you've purchased</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Purchase Price</TableHead>
                  <TableHead>Editor</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ownedManuscripts.map((manuscript) => (
                  <TableRow key={manuscript.id}>
                    <TableCell className="font-medium">{manuscript.title}</TableCell>
                    <TableCell>{manuscript.writerName}</TableCell>
                    <TableCell>{manuscript.genre}</TableCell>
                    <TableCell>
                      <Badge className={
                        manuscript.status === "acquired" ? "bg-blue-500" :
                        manuscript.status === "editing" ? "bg-amber-500" :
                        "bg-green-500"
                      }>
                        {manuscript.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${manuscript.purchasePrice}</TableCell>
                    <TableCell>
                      {manuscript.editorAssigned ? manuscript.editorAssigned.name : "Not assigned"}
                    </TableCell>
                    <TableCell className="text-right">
                      {manuscript.status === "acquired" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => listForEditing(manuscript.id)}
                        >
                          Find Editor
                        </Button>
                      )}
                      {manuscript.status === "editing" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                        >
                          View Progress
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {ownedManuscripts.some(m => m.editorOffers.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Editor Applications</CardTitle>
              <CardDescription>Review and select editors for your manuscripts</CardDescription>
            </CardHeader>
            <CardContent>
              {ownedManuscripts.map(manuscript => 
                manuscript.editorOffers.length > 0 && (
                  <div key={manuscript.id} className="mb-6 border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Applications for "{manuscript.title}"
                    </h3>
                    {manuscript.editorOffers.map(offer => (
                      <div key={offer.id} className="border-l-4 border-admin-primary pl-4 mb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{offer.editorName}</p>
                            <p className="text-sm text-muted-foreground">
                              Applied on {new Date(offer.date).toLocaleDateString()}
                            </p>
                            <p className="mt-2">{offer.message}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold flex items-center">
                              <DollarSign size={18} className="mr-1" />
                              {offer.fee}
                            </p>
                            <Button 
                              size="sm" 
                              className="mt-2 bg-admin-primary hover:bg-admin-primary/90"
                              onClick={() => acceptEditorOffer(manuscript.id, offer)}
                            >
                              Hire Editor
                            </Button>
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

      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
            <DialogDescription>
              Submit your offer for "{selectedManuscript?.title}" by {selectedManuscript?.writerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Offer Amount ($)</Label>
              <Input 
                id="amount" 
                type="number" 
                value={offerAmount}
                onChange={(e) => setOfferAmount(parseInt(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">
                Asking price: ${selectedManuscript?.askingPrice}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message to Writer</Label>
              <Textarea 
                id="message" 
                placeholder="Tell the writer why you're interested in their manuscript..."
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOfferDialog(false)}>Cancel</Button>
            <Button onClick={submitOffer} className="bg-admin-primary hover:bg-admin-primary/90">
              Submit Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PublisherMarketplace;
