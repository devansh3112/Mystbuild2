import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch notifications
  const fetchNotifications = useCallback(async (limit = 50) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select(`
          *,
          manuscripts:manuscript_id (
            id,
            title
          ),
          assignments:assignment_id (
            id,
            status,
            priority
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) {
        throw fetchError;
      }

      setNotifications(data || []);
      
      // Count unread notifications
      const unread = data?.filter(n => !n.is_read).length || 0;
      setUnreadCount(unread);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create notification
  const createNotification = useCallback(async (notificationData) => {
    try {
      const notification = {
        user_id: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        category: notificationData.category || 'general',
        manuscript_id: notificationData.manuscriptId,
        assignment_id: notificationData.assignmentId,
        metadata: notificationData.metadata
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error creating notification:', err);
      throw err;
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));

      return data;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, [user]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        throw error;
      }

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      setUnreadCount(0);
      toast.success('All notifications marked as read');

    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Failed to mark notifications as read');
    }
  }, [user]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      const deletedNotification = notifications.find(n => n.id === notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      toast.success('Notification deleted');

    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
    }
  }, [user, notifications]);

  // Clear all read notifications
  const clearReadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('is_read', true);

      if (error) {
        throw error;
      }

      setNotifications(prev => prev.filter(n => !n.is_read));
      toast.success('Read notifications cleared');

    } catch (err) {
      console.error('Error clearing notifications:', err);
      toast.error('Failed to clear notifications');
    }
  }, [user]);

  // Get notifications by category
  const getNotificationsByCategory = useCallback((category) => {
    return notifications.filter(n => n.category === category);
  }, [notifications]);

  // Get recent notifications
  const getRecentNotifications = useCallback((hours = 24) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return notifications.filter(n => new Date(n.created_at) > cutoff);
  }, [notifications]);

  // Utility function to create common notification types
  const notificationHelpers = {
    // Manuscript-related notifications
    manuscriptStatusChanged: (userId, manuscriptId, title, oldStatus, newStatus) => 
      createNotification({
        userId,
        title: 'Manuscript Status Updated',
        message: `"${title}" status changed from ${oldStatus} to ${newStatus}`,
        type: 'info',
        category: 'manuscript',
        manuscriptId
      }),

    assignmentCreated: (userId, manuscriptId, title, editorName) =>
      createNotification({
        userId,
        title: 'New Assignment',
        message: `You have been assigned to edit "${title}" by ${editorName}`,
        type: 'info',
        category: 'assignment',
        manuscriptId
      }),

    deadlineApproaching: (userId, manuscriptId, title, deadline) =>
      createNotification({
        userId,
        title: 'Deadline Approaching',
        message: `Deadline for "${title}" is approaching (${deadline})`,
        type: 'warning',
        category: 'deadline',
        manuscriptId
      }),

    reviewReceived: (userId, manuscriptId, title, reviewerName) =>
      createNotification({
        userId,
        title: 'New Review Received',
        message: `${reviewerName} has reviewed your manuscript "${title}"`,
        type: 'success',
        category: 'review',
        manuscriptId
      }),

    manuscriptApproved: (userId, manuscriptId, title) =>
      createNotification({
        userId,
        title: 'Manuscript Approved',
        message: `Congratulations! Your manuscript "${title}" has been approved for publication`,
        type: 'success',
        category: 'manuscript',
        manuscriptId
      }),

    manuscriptRejected: (userId, manuscriptId, title, reason) =>
      createNotification({
        userId,
        title: 'Manuscript Rejected',
        message: `Your manuscript "${title}" has been rejected. Reason: ${reason}`,
        type: 'error',
        category: 'manuscript',
        manuscriptId
      })
  };

  // Initial load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          if (!payload.new.is_read) {
            setUnreadCount(prev => prev + 1);
          }
          
          // Show toast for new notification
          toast(payload.new.title, {
            description: payload.new.message,
            action: {
              label: 'View',
              onClick: () => markAsRead(payload.new.id)
            }
          });
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev => 
            prev.map(n => n.id === payload.new.id ? payload.new : n)
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, markAsRead]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    getNotificationsByCategory,
    getRecentNotifications,
    notificationHelpers
  };
};

export default useNotifications; 