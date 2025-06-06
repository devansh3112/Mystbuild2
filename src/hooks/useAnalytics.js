import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Track user activity
  const trackActivity = useCallback(async (action, resourceType = null, resourceId = null, metadata = {}) => {
    if (!user) return;

    try {
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          metadata,
          ip_address: null, // Could be filled by Edge Function
          user_agent: navigator.userAgent
        });
    } catch (err) {
      console.error('Error tracking activity:', err);
    }
  }, [user]);

  // Track manuscript view
  const trackManuscriptView = useCallback(async (manuscriptId, timeSpent = 0) => {
    await trackActivity('manuscript_view', 'manuscript', manuscriptId, { timeSpent });
    
    // Update manuscript analytics
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await supabase
        .from('manuscript_analytics')
        .upsert({
          manuscript_id: manuscriptId,
          date: today,
          views: supabase.raw('views + 1'),
          time_spent_seconds: supabase.raw(`time_spent_seconds + ${timeSpent}`)
        });
    } catch (err) {
      console.error('Error updating manuscript analytics:', err);
    }
  }, [trackActivity]);

  // Track manuscript download
  const trackManuscriptDownload = useCallback(async (manuscriptId) => {
    await trackActivity('manuscript_download', 'manuscript', manuscriptId);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await supabase
        .from('manuscript_analytics')
        .upsert({
          manuscript_id: manuscriptId,
          date: today,
          downloads: supabase.raw('downloads + 1')
        });
    } catch (err) {
      console.error('Error updating download analytics:', err);
    }
  }, [trackActivity]);

  // Get dashboard analytics
  const getDashboardAnalytics = useCallback(async (dateRange = 30) => {
    if (!user || user.role !== 'publisher') {
      throw new Error('Only publishers can access dashboard analytics');
    }

    setLoading(true);
    setError(null);

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);
      const startDateStr = startDate.toISOString().split('T')[0];

      // Get manuscript submission trends
      const { data: manuscriptTrends, error: manuscriptError } = await supabase
        .from('manuscripts')
        .select('created_at, status, genre')
        .gte('created_at', startDateStr);

      if (manuscriptError) throw manuscriptError;

      // Get user activity trends
      const { data: activityTrends, error: activityError } = await supabase
        .from('user_activity')
        .select('created_at, action, resource_type, profiles:user_id(role)')
        .gte('created_at', startDateStr);

      if (activityError) throw activityError;

      // Get editor performance
      const { data: editorMetrics, error: editorError } = await supabase
        .from('editor_metrics')
        .select('*')
        .gte('month', startDateStr);

      if (editorError) throw editorError;

      // Get manuscript analytics
      const { data: manuscriptAnalytics, error: analyticsError } = await supabase
        .from('manuscript_analytics')
        .select(`
          *,
          manuscripts:manuscript_id (
            title,
            genre,
            status
          )
        `)
        .gte('date', startDateStr);

      if (analyticsError) throw analyticsError;

      return {
        manuscriptTrends,
        activityTrends,
        editorMetrics,
        manuscriptAnalytics
      };

    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard analytics:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get user activity report
  const getUserActivityReport = useCallback(async (userId = null, dateRange = 30) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return null;

    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);
      
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', targetUserId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process data for insights
      const actionCounts = data.reduce((acc, activity) => {
        acc[activity.action] = (acc[activity.action] || 0) + 1;
        return acc;
      }, {});

      const dailyActivity = data.reduce((acc, activity) => {
        const date = activity.created_at.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return {
        activities: data,
        actionCounts,
        dailyActivity,
        totalActivities: data.length
      };

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get manuscript performance report
  const getManuscriptReport = useCallback(async (manuscriptId, dateRange = 30) => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);
      
      const { data: analytics, error: analyticsError } = await supabase
        .from('manuscript_analytics')
        .select('*')
        .eq('manuscript_id', manuscriptId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (analyticsError) throw analyticsError;

      const { data: activities, error: activityError } = await supabase
        .from('user_activity')
        .select(`
          *,
          profiles:user_id (
            name,
            role
          )
        `)
        .eq('resource_id', manuscriptId)
        .eq('resource_type', 'manuscript')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (activityError) throw activityError;

      // Calculate totals
      const totalViews = analytics.reduce((sum, day) => sum + day.views, 0);
      const totalDownloads = analytics.reduce((sum, day) => sum + day.downloads, 0);
      const totalTimeSpent = analytics.reduce((sum, day) => sum + day.time_spent_seconds, 0);

      return {
        analytics,
        activities,
        totalViews,
        totalDownloads,
        totalTimeSpent,
        averageTimePerView: totalViews > 0 ? totalTimeSpent / totalViews : 0
      };

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get editor performance report
  const getEditorReport = useCallback(async (editorId, months = 6) => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const { data: metrics, error: metricsError } = await supabase
        .from('editor_metrics')
        .select('*')
        .eq('editor_id', editorId)
        .gte('month', startDate.toISOString().split('T')[0])
        .order('month', { ascending: true });

      if (metricsError) throw metricsError;

      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          *,
          manuscripts:manuscript_id (
            title,
            status,
            genre
          )
        `)
        .eq('editor_id', editorId)
        .gte('assigned_date', startDate.toISOString())
        .order('assigned_date', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      // Calculate performance indicators
      const totalAssigned = metrics.reduce((sum, m) => sum + m.assigned_count, 0);
      const totalCompleted = metrics.reduce((sum, m) => sum + m.completed_count, 0);
      const avgSatisfaction = metrics.length > 0 
        ? metrics.reduce((sum, m) => sum + m.satisfaction_rating, 0) / metrics.length 
        : 0;
      const avgOnTimeRate = metrics.length > 0 
        ? metrics.reduce((sum, m) => sum + m.on_time_rate, 0) / metrics.length 
        : 0;

      return {
        metrics,
        assignments,
        performance: {
          totalAssigned,
          totalCompleted,
          completionRate: totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0,
          avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
          avgOnTimeRate: Math.round(avgOnTimeRate * 100)
        }
      };

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Export data as CSV
  const exportToCSV = useCallback((data, filename) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }, []);

  // Common activity tracking helpers
  const activityHelpers = {
    login: () => trackActivity('login'),
    logout: () => trackActivity('logout'),
    manuscriptCreate: (manuscriptId) => trackActivity('manuscript_create', 'manuscript', manuscriptId),
    manuscriptEdit: (manuscriptId) => trackActivity('manuscript_edit', 'manuscript', manuscriptId),
    manuscriptSubmit: (manuscriptId) => trackActivity('manuscript_submit', 'manuscript', manuscriptId),
    chapterCreate: (chapterId, manuscriptId) => trackActivity('chapter_create', 'chapter', chapterId, { manuscriptId }),
    chapterEdit: (chapterId, manuscriptId) => trackActivity('chapter_edit', 'chapter', chapterId, { manuscriptId }),
    reviewCreate: (reviewId, manuscriptId) => trackActivity('review_create', 'review', reviewId, { manuscriptId }),
    assignmentAccept: (assignmentId) => trackActivity('assignment_accept', 'assignment', assignmentId),
    assignmentComplete: (assignmentId) => trackActivity('assignment_complete', 'assignment', assignmentId)
  };

  return {
    loading,
    error,
    trackActivity,
    trackManuscriptView,
    trackManuscriptDownload,
    getDashboardAnalytics,
    getUserActivityReport,
    getManuscriptReport,
    getEditorReport,
    exportToCSV,
    activityHelpers
  };
};

export default useAnalytics; 