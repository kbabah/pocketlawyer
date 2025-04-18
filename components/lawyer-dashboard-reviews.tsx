import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Star, Search, Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

interface Review {
  id: string;
  lawyerId: string;
  clientId: string;
  clientName: string;
  clientPhotoURL?: string;
  rating: number;
  comment: string;
  consultationId?: string;
  reply?: string;
  createdAt: string;
  updatedAt: string;
  replyAt?: string;
}

interface LawyerDashboardReviewsProps {
  lawyerId: string;
}

export function LawyerDashboardReviews({ lawyerId }: LawyerDashboardReviewsProps) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset reply text when dialog opens
  useEffect(() => {
    if (!isReplyDialogOpen) {
      setReplyText('');
    }
  }, [isReplyDialogOpen]);

  // Fetch reviews on component mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?lawyerId=${lawyerId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        setReviews(data);
        filterReviews(data, activeTab, searchQuery);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast({
          title: 'Error',
          description: 'Failed to load reviews. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviews();
  }, [lawyerId, toast]);

  // Filter reviews based on active tab and search query
  const filterReviews = (
    reviewsData: Review[],
    tab: string,
    query: string
  ) => {
    let filtered = [...reviewsData];
    
    // Filter by tab
    switch (tab) {
      case 'replied':
        filtered = filtered.filter((r) => !!r.reply);
        break;
      case 'unreplied':
        filtered = filtered.filter((r) => !r.reply);
        break;
      case 'all':
      default:
        // No filtering needed
        break;
    }
    
    // Filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.comment.toLowerCase().includes(lowerQuery) ||
          r.clientName.toLowerCase().includes(lowerQuery) ||
          (r.reply && r.reply.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    setFilteredReviews(filtered);
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    filterReviews(reviews, tab, searchQuery);
  };

  // Handle search with undefined check
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value || '';
    setSearchQuery(query);
    filterReviews(reviews, activeTab, query);
  };

  // Open reply dialog and set initial reply text
  const handleOpenReply = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.reply || '');
    setIsReplyDialogOpen(true);
  };

  // Submit reply to review
  const handleReplySubmit = async () => {
    if (!selectedReview) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/reviews/${selectedReview.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reply: replyText }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit reply');
      }
      
      // Update reviews with the new reply
      const updatedReviews = reviews.map(r => {
        if (r.id === selectedReview.id) {
          return { 
            ...r, 
            reply: replyText, 
            replyAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return r;
      });
      
      setReviews(updatedReviews);
      filterReviews(updatedReviews, activeTab, searchQuery);
      
      toast({
        title: 'Reply Submitted',
        description: 'Your reply has been posted successfully.',
      });
      
      setIsReplyDialogOpen(false);
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast({
        title: 'Reply Failed',
        description: 'Failed to submit your reply. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Calculate average rating from reviews
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  };

  // Calculate rating counts for each star level
  const calculateRatingCounts = () => {
    const counts = [0, 0, 0, 0, 0]; // 5 stars to 1 star
    
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        counts[5 - review.rating]++;
      }
    });
    
    return counts;
  };

  const ratingCounts = calculateRatingCounts();
  const totalReviews = reviews.length;
  
  return (
    <div className="space-y-6">
      {/* Reviews Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews Summary</CardTitle>
          <CardDescription>
            Overview of your client feedback and ratings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r pb-6 md:pb-0 md:pr-6">
              <div className="text-4xl font-bold">{calculateAverageRating()}</div>
              <div className="flex my-2">
                {renderStars(Math.round(calculateAverageRating()))}
              </div>
              <div className="text-sm text-muted-foreground">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </div>
            </div>
            
            <div className="md:w-2/3">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingCounts[5 - star];
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <div className="flex items-center w-16">
                        <span className="text-sm mr-1">{star}</span>
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="bg-yellow-400 h-full rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-10 text-sm text-right">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Reviews List Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Client Reviews</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search in reviews..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full sm:w-[240px] pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-6"
          >
            <TabsList>
              <TabsTrigger value="all">All Reviews</TabsTrigger>
              <TabsTrigger value="unreplied">Awaiting Responses</TabsTrigger>
              <TabsTrigger value="replied">Responded Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reviews are available.
                </div>
              ) : (
                <>
                  <div className="grid gap-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={review.clientPhoto} alt={review.clientName} />
                              <AvatarFallback>{review.clientName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{review.clientName}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(review.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        
                        <div className="mb-4 whitespace-pre-line">{review.comment}</div>
                        
                        {review.reply ? (
                          <div className="bg-muted rounded p-3 mt-3">
                            <div className="flex items-center mb-2">
                              <Badge variant="outline" className="mr-2">Your Response</Badge>
                              <span className="text-xs text-muted-foreground">
                                {review.replyAt && formatDate(review.replyAt)}
                              </span>
                            </div>
                            <div className="whitespace-pre-line text-sm">{review.reply}</div>
                          </div>
                        ) : (
                          <div className="flex justify-end mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenReply(review)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Reply to Review
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
            <DialogDescription>
              Your response will be visible to all users. Please maintain a professional and constructive tone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div className="bg-muted rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{selectedReview.clientName}</div>
                  <div className="flex">{renderStars(selectedReview.rating)}</div>
                </div>
                <p className="text-sm whitespace-pre-line">{selectedReview.comment}</p>
              </div>
              
              <Textarea
                placeholder="Write your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReplyDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleReplySubmit}
              disabled={!replyText.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reply'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}