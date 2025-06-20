import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { 
  BookOpen, 
  Search, 
  Filter, 
  DollarSign, 
  Calendar, 
  User, 
  FileText, 
  ShoppingCart,
  Star,
  Eye,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { getEditingPrice, getPricingSlab } from "@/lib/payments";

interface Manuscript {
  id: string;
  title: string;
  synopsis: string;
  genre: string;
  word_count: number;
  status: string;
  payment_status: string;
  created_at: string;
  author_id: string;
  cover_image_url?: string;
  content_url?: string;
  profiles: {
    name: string;
    avatar_url?: string;
  };
}

const PublisherMarketplace: React.FC = () => {
  const { user } = useAuth();
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [filteredManuscripts, setFilteredManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchAvailableManuscripts();
  }, []);

  useEffect(() => {
    filterManuscripts();
  }, [manuscripts, searchTerm, genreFilter, statusFilter]);

  const fetchAvailableManuscripts = async () => {
    try {
      setLoading(true);
      
      // Fetch manuscripts that are available for purchase by publishers
      // These should be manuscripts where payment_status is 'paid' but not yet owned by this publisher
      const { data, error } = await supabase
        .from('manuscripts')
        .select(`
          *,
          profiles!manuscripts_author_id_fkey(name, avatar_url)
        `)
        .eq('payment_status', 'paid')
        .neq('author_id', user?.id) // Don't show publisher's own manuscripts
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out manuscripts already purchased by this publisher
      const { data: purchases } = await supabase
        .from('publisher_purchases')
        .select('manuscript_id')
        .eq('publisher_id', user?.id);

      const purchasedIds = purchases?.map(p => p.manuscript_id) || [];
      const availableManuscripts = (data || []).filter(m => !purchasedIds.includes(m.id));

      setManuscripts(availableManuscripts);
    } catch (error) {
      console.error('Error fetching manuscripts:', error);
      toast.error('Failed to load marketplace manuscripts');
    } finally {
      setLoading(false);
    }
  };

  const filterManuscripts = () => {
    let filtered = manuscripts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.synopsis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Genre filter
    if (genreFilter !== "all") {
      filtered = filtered.filter(m => m.genre === genreFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    setFilteredManuscripts(filtered);
  };

  const handlePurchaseManuscript = async (manuscript: Manuscript) => {
    setSelectedManuscript(manuscript);
    setShowPurchaseDialog(true);
  };

  const confirmPurchase = async () => {
    if (!selectedManuscript) return;

    try {
      setPurchasing(true);

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from('publisher_purchases')
        .insert({
          publisher_id: user?.id,
          manuscript_id: selectedManuscript.id,
          purchase_price: getEditingPrice(selectedManuscript.word_count, 'NGN'),
          purchase_date: new Date().toISOString(),
          status: 'purchased'
        });

      if (purchaseError) throw purchaseError;

      // Update manuscript status
      const { error: updateError } = await supabase
        .from('manuscripts')
        .update({ 
          status: 'purchased_by_publisher',
          publisher_id: user?.id 
        })
        .eq('id', selectedManuscript.id);

      if (updateError) throw updateError;

      toast.success(`Successfully purchased "${selectedManuscript.title}"!`);
      setShowPurchaseDialog(false);
      setSelectedManuscript(null);
      
      // Refresh the marketplace
      fetchAvailableManuscripts();

    } catch (error) {
      console.error('Error purchasing manuscript:', error);
      toast.error('Failed to purchase manuscript');
    } finally {
      setPurchasing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'editing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Editing</Badge>;
      case 'payment_received':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Ready</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const genres = [...new Set(manuscripts.map(m => m.genre))];

  return (
    <DashboardLayout role="publisher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manuscript Marketplace</h1>
            <p className="text-muted-foreground">Discover and purchase manuscripts from talented writers</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary">
              {filteredManuscripts.length} Available
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search manuscripts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="payment_received">Ready to Edit</SelectItem>
                  <SelectItem value="editing">In Editing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setGenreFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manuscripts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
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
        ) : filteredManuscripts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No manuscripts found</h3>
              <p className="text-muted-foreground">
                {searchTerm || genreFilter !== "all" || statusFilter !== "all" 
                  ? "Try adjusting your search criteria"
                  : "No manuscripts are currently available for purchase"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredManuscripts.map((manuscript) => (
              <ManuscriptCard 
                key={manuscript.id} 
                manuscript={manuscript} 
                onPurchase={handlePurchaseManuscript}
              />
            ))}
          </div>
        )}

        {/* Purchase Confirmation Dialog */}
        <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Purchase Manuscript</DialogTitle>
              <DialogDescription>
                Confirm your purchase of "{selectedManuscript?.title}"
              </DialogDescription>
            </DialogHeader>
            
            {selectedManuscript && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Author:</span>
                    <div>{selectedManuscript.profiles?.name}</div>
                  </div>
                  <div>
                    <span className="font-medium">Genre:</span>
                    <div>{selectedManuscript.genre}</div>
                  </div>
                  <div>
                    <span className="font-medium">Word Count:</span>
                    <div>{selectedManuscript.word_count?.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="font-medium">Purchase Price:</span>
                    <div className="text-lg font-bold text-primary">
                      ₦{getEditingPrice(selectedManuscript.word_count || 0, 'NGN').toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">What you'll get:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Full manuscript access and ownership rights</li>
                    <li>• Ability to assign editors from your team</li>
                    <li>• Complete publishing rights</li>
                    <li>• Progress tracking and management tools</li>
                  </ul>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowPurchaseDialog(false)}
                disabled={purchasing}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmPurchase}
                disabled={purchasing}
                className="bg-primary text-primary-foreground"
              >
                {purchasing ? "Processing..." : "Confirm Purchase"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

const ManuscriptCard: React.FC<{ 
  manuscript: Manuscript; 
  onPurchase: (manuscript: Manuscript) => void;
}> = ({ manuscript, onPurchase }) => {
  const slab = getPricingSlab(manuscript.word_count || 0);
  const price = getEditingPrice(manuscript.word_count || 0, 'NGN');

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-2">{manuscript.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <User className="h-3 w-3" />
              {manuscript.profiles?.name}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">₦{price.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{slab.name}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {manuscript.word_count?.toLocaleString()} words
          </div>
          <Badge variant="outline">{manuscript.genre}</Badge>
        </div>

        {manuscript.synopsis && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {manuscript.synopsis}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {new Date(manuscript.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-xs text-green-600">Payment Verified</span>
          </div>
        </div>

        <Button 
          onClick={() => onPurchase(manuscript)}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Purchase Manuscript
        </Button>
      </CardContent>
    </Card>
  );
};

export default PublisherMarketplace;
