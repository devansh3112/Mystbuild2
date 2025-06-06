import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useWorkflow = (manuscriptId) => {
  const [workflow, setWorkflow] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Manuscript status workflow
  const statusWorkflow = {
    'submitted': ['under_review', 'rejected'],
    'under_review': ['approved', 'rejected', 'revision_requested'],
    'revision_requested': ['submitted', 'rejected'],
    'approved': ['published', 'under_review'],
    'rejected': ['submitted'],
    'published': []
  };

  // Fetch workflow data
  const fetchWorkflowData = useCallback(async () => {
    if (!manuscriptId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch manuscript with assignment details
      const { data: manuscriptData, error: manuscriptError } = await supabase
        .from('manuscripts')
        .select(`
          *,
          profiles:author_id (
            id,
            name,
            role
          ),
          assignments (
            id,
            editor_id,
            status,
            priority,
            deadline,
            progress_percentage,
            profiles:editor_id (
              id,
              name,
              avatar_url
            )
          )
        `)
        .eq('id', manuscriptId)
        .single();

      if (manuscriptError) {
        throw manuscriptError;
      }

      setWorkflow(manuscriptData);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:reviewer_id (
            id,
            name,
            avatar_url,
            role
          ),
          chapters:chapter_id (
            id,
            title,
            number
          )
        `)
        .eq('manuscript_id', manuscriptId)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        throw reviewsError;
      }

      setReviews(reviewsData || []);

      // Fetch workflow history
      const { data: historyData, error: historyError } = await supabase
        .from('workflow_history')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            role
          )
        `)
        .eq('manuscript_id', manuscriptId)
        .order('created_at', { ascending: false });

      if (historyError) {
        throw historyError;
      }

      setHistory(historyData || []);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching workflow data:', err);
    } finally {
      setLoading(false);
    }
  }, [manuscriptId]);

  // Update manuscript status
  const updateManuscriptStatus = useCallback(async (newStatus, notes = '') => {
    if (!manuscriptId || !user) {
      throw new Error('Manuscript ID and user required');
    }

    const currentStatus = workflow?.status;
    const allowedStatuses = statusWorkflow[currentStatus] || [];

    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`);
    }

    try {
      // Update manuscript status
      const { data, error } = await supabase
        .from('manuscripts')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', manuscriptId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Record workflow history
      await supabase
        .from('workflow_history')
        .insert({
          manuscript_id: manuscriptId,
          user_id: user.id,
          action: 'status_change',
          old_status: currentStatus,
          new_status: newStatus,
          notes,
          metadata: {
            user_role: user.role,
            timestamp: new Date().toISOString()
          }
        });

      setWorkflow(prev => ({ ...prev, ...data }));
      await fetchWorkflowData(); // Refresh to get updated history
      toast.success(`Manuscript status updated to ${newStatus}`);

      return data;
    } catch (err) {
      toast.error(`Failed to update status: ${err.message}`);
      throw err;
    }
  }, [manuscriptId, user, workflow?.status, fetchWorkflowData]);

  // Create review/feedback
  const createReview = useCallback(async (reviewData) => {
    if (!manuscriptId || !user) {
      throw new Error('Manuscript ID and user required');
    }

    try {
      const review = {
        manuscript_id: manuscriptId,
        reviewer_id: user.id,
        review_type: reviewData.type || 'general',
        content: reviewData.content,
        rating: reviewData.rating,
        chapter_id: reviewData.chapterId,
        line_number: reviewData.lineNumber,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select(`
          *,
          profiles:reviewer_id (
            id,
            name,
            avatar_url,
            role
          ),
          chapters:chapter_id (
            id,
            title,
            number
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      // Record in workflow history
      await supabase
        .from('workflow_history')
        .insert({
          manuscript_id: manuscriptId,
          user_id: user.id,
          action: 'review_created',
          notes: `Created ${reviewData.type} review`,
          metadata: {
            review_id: data.id,
            review_type: reviewData.type
          }
        });

      setReviews(prev => [data, ...prev]);
      toast.success('Review created successfully');

      return data;
    } catch (err) {
      toast.error(`Failed to create review: ${err.message}`);
      throw err;
    }
  }, [manuscriptId, user]);

  // Update review status
  const updateReviewStatus = useCallback(async (reviewId, status, notes = '') => {
    if (!user) {
      throw new Error('User required');
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Record in workflow history
      await supabase
        .from('workflow_history')
        .insert({
          manuscript_id: manuscriptId,
          user_id: user.id,
          action: 'review_updated',
          notes: `Review marked as ${status}: ${notes}`,
          metadata: {
            review_id: reviewId,
            new_status: status
          }
        });

      setReviews(prev => prev.map(review => 
        review.id === reviewId ? { ...review, ...data } : review
      ));

      toast.success(`Review ${status} successfully`);
      return data;
    } catch (err) {
      toast.error(`Failed to update review: ${err.message}`);
      throw err;
    }
  }, [user, manuscriptId]);

  // Update assignment progress
  const updateAssignmentProgress = useCallback(async (assignmentId, progress, notes = '') => {
    if (!user) {
      throw new Error('User required');
    }

    try {
      const { data, error } = await supabase
        .from('assignments')
        .update({
          progress_percentage: progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Auto-update assignment status based on progress
      let newStatus = data.status;
      if (progress === 0) {
        newStatus = 'assigned';
      } else if (progress < 100) {
        newStatus = 'in_progress';
      } else {
        newStatus = 'completed';
      }

      if (newStatus !== data.status) {
        await supabase
          .from('assignments')
          .update({ status: newStatus })
          .eq('id', assignmentId);
      }

      // Record in workflow history
      await supabase
        .from('workflow_history')
        .insert({
          manuscript_id: manuscriptId,
          user_id: user.id,
          action: 'assignment_progress_updated',
          notes: `Assignment progress updated to ${progress}%: ${notes}`,
          metadata: {
            assignment_id: assignmentId,
            progress: progress,
            old_status: data.status,
            new_status: newStatus
          }
        });

      await fetchWorkflowData(); // Refresh to get updated assignment
      toast.success('Assignment progress updated');

      return data;
    } catch (err) {
      toast.error(`Failed to update progress: ${err.message}`);
      throw err;
    }
  }, [user, manuscriptId, fetchWorkflowData]);

  // Get available status transitions
  const getAvailableStatusTransitions = useCallback(() => {
    if (!workflow?.status) return [];
    return statusWorkflow[workflow.status] || [];
  }, [workflow?.status]);

  // Check if user can perform action
  const canPerformAction = useCallback((action) => {
    if (!user || !workflow) return false;

    switch (action) {
      case 'update_status':
        return user.role === 'publisher' || user.role === 'editor';
      case 'create_review':
        return user.role === 'editor' || 
               (user.role === 'publisher') ||
               (user.role === 'writer' && workflow.author_id === user.id);
      case 'update_assignment':
        return user.role === 'publisher' || 
               workflow.assignments?.some(a => a.editor_id === user.id);
      case 'view_workflow':
        return user.role === 'publisher' ||
               workflow.author_id === user.id ||
               workflow.assignments?.some(a => a.editor_id === user.id);
      default:
        return false;
    }
  }, [user, workflow]);

  // Get workflow statistics
  const getWorkflowStats = useCallback(() => {
    if (!workflow || !reviews || !history) return null;

    const totalReviews = reviews.length;
    const pendingReviews = reviews.filter(r => r.status === 'pending').length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews 
      : 0;

    const activeAssignments = workflow.assignments?.filter(a => 
      ['assigned', 'in_progress'].includes(a.status)
    ).length || 0;

    const completedAssignments = workflow.assignments?.filter(a => 
      a.status === 'completed'
    ).length || 0;

    return {
      totalReviews,
      pendingReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      activeAssignments,
      completedAssignments,
      workflowEvents: history.length,
      canTransition: getAvailableStatusTransitions().length > 0
    };
  }, [workflow, reviews, history, getAvailableStatusTransitions]);

  // Initial load
  useEffect(() => {
    fetchWorkflowData();
  }, [fetchWorkflowData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!manuscriptId) return;

    const manuscriptSubscription = supabase
      .channel(`manuscript-workflow-${manuscriptId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'manuscripts',
          filter: `id=eq.${manuscriptId}`
        }, 
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setWorkflow(prev => ({ ...prev, ...payload.new }));
          }
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'reviews',
          filter: `manuscript_id=eq.${manuscriptId}`
        }, 
        () => {
          fetchWorkflowData(); // Refresh all data when reviews change
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'workflow_history',
          filter: `manuscript_id=eq.${manuscriptId}`
        }, 
        () => {
          fetchWorkflowData(); // Refresh all data when history changes
        }
      )
      .subscribe();

    return () => {
      manuscriptSubscription.unsubscribe();
    };
  }, [manuscriptId, fetchWorkflowData]);

  return {
    workflow,
    reviews,
    history,
    loading,
    error,
    updateManuscriptStatus,
    createReview,
    updateReviewStatus,
    updateAssignmentProgress,
    getAvailableStatusTransitions,
    canPerformAction,
    getWorkflowStats,
    refetch: fetchWorkflowData
  };
};

export default useWorkflow; 