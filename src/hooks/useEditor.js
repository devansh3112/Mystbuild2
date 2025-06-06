import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to manage editor-related data and operations
 * Includes editor lists, assignments, and performance metrics
 */
export const useEditor = (options = {}) => {
  const [editors, setEditors] = useState([]);
  const [editorMetrics, setEditorMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, session } = useAuth();
  
  // Feature flag to control whether we use real or mock data
  const useRealData = options.useRealData || false;
  
  // Filter options
  const includeMetrics = options.includeMetrics || false;
  const status = options.status || 'active';

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLoading) {
        console.log("Tab became visible while loading editors - providing fallback data");
        provideFallbackData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoading]);

  // Helper function to provide fallback data when needed
  const provideFallbackData = () => {
    setIsLoading(false);
    
    if (!editors.length) {
      console.log("Providing fallback editor data");
      
      const mockEditors = [
        {
          id: "editor-1",
          name: "Priya Sharma",
          email: "priya.sharma@example.com",
          bio: "Senior editor with 10+ years of experience in fiction editing.",
          avatar: "https://i.pravatar.cc/150?img=48",
          specialties: ["Fiction", "Romance", "Drama"],
          active: true,
          created_at: "2024-01-15T00:00:00"
        },
        {
          id: "editor-2", 
          name: "Mark Davis",
          email: "mark.davis@example.com",
          bio: "Experienced editor specializing in mystery and thriller genres.",
          avatar: "https://i.pravatar.cc/150?img=52",
          specialties: ["Mystery", "Thriller", "Suspense"],
          active: true,
          created_at: "2024-02-10T00:00:00"
        },
        {
          id: "editor-3",
          name: "James Wilson", 
          email: "james.wilson@example.com",
          bio: "Technical editor with expertise in science fiction and fantasy.",
          avatar: "https://i.pravatar.cc/150?img=55",
          specialties: ["Science Fiction", "Fantasy", "Technical Writing"],
          active: true,
          created_at: "2024-03-05T00:00:00"
        }
      ];

      const mockMetrics = includeMetrics ? [
        {
          id: "metric-1",
          editor_id: "editor-1",
          month: "2025-05-01",
          assigned_count: 4,
          completed_count: 4,
          satisfaction_rating: 4.9,
          on_time_rate: 1.0,
          profiles: { name: "Priya Sharma" }
        },
        {
          id: "metric-2",
          editor_id: "editor-2", 
          month: "2025-05-01",
          assigned_count: 5,
          completed_count: 3,
          satisfaction_rating: 4.8,
          on_time_rate: 1.0,
          profiles: { name: "Mark Davis" }
        },
        {
          id: "metric-3",
          editor_id: "editor-3",
          month: "2025-05-01", 
          assigned_count: 6,
          completed_count: 5,
          satisfaction_rating: 4.7,
          on_time_rate: 0.95,
          profiles: { name: "James Wilson" }
        }
      ] : [];

      setEditors(mockEditors);
      setEditorMetrics(mockMetrics);
    }
  };

  useEffect(() => {
    const fetchEditors = async () => {
      try {
        setIsLoading(true);
        
        // Set a timeout to ensure loading state doesn't get stuck
        const timeoutId = setTimeout(() => {
          if (isLoading) {
            console.log("Editor loading timeout reached - using fallback data");
            provideFallbackData();
          }
        }, 3000); // 3 second timeout
        
        if (!useRealData) {
          // If not using real data, return early and use fallback data
          provideFallbackData();
          clearTimeout(timeoutId);
          return;
        }

        console.log("Fetching editor data");

        // Fetch editors from profiles where role = 'editor'
        const { data: editorsData, error: editorsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'editor')
          .eq('active', status === 'active');

        console.log("Editors data:", editorsData, editorsError);

        if (editorsError) {
          console.log("Editors error:", editorsError);
          throw editorsError;
        }

        // Fetch editor metrics if requested
        let metricsData = [];
        if (includeMetrics) {
          const { data: metrics, error: metricsError } = await supabase
            .from('editor_metrics')
            .select(`
              *,
              profiles(name)
            `)
            .order('month', { ascending: false });

          console.log("Editor metrics data:", metrics, metricsError);

          if (metricsError) {
            console.log("Editor metrics error:", metricsError);
            throw metricsError;
          }

          metricsData = metrics || [];
        }

        // Check visibility state before updating state
        if (document.visibilityState !== 'visible') {
          console.log("Tab not visible, using fallback data");
          clearTimeout(timeoutId);
          provideFallbackData();
          return;
        }
        
        console.log("Setting editor data:", editorsData);
        
        setEditors(editorsData || []);
        setEditorMetrics(metricsData);
        clearTimeout(timeoutId);
        
      } catch (err) {
        console.error('Error fetching editor data:', err);
        setError(err.message);
        provideFallbackData();
      } finally {
        setIsLoading(false);
      }
    };

    fetchEditors();
    
    return () => {
      console.log("Cleaning up editor data fetch");
    };
  }, [session, useRealData, user, includeMetrics, status]);

  // Function to assign an editor to a manuscript
  const assignEditor = async (manuscriptId, editorId) => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert([
          {
            manuscript_id: manuscriptId,
            editor_id: editorId,
            status: 'assigned',
            assigned_date: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      console.log("Editor assigned successfully:", data);
      return { success: true, data };
      
    } catch (err) {
      console.error('Error assigning editor:', err);
      return { success: false, error: err.message };
    }
  };

  // Function to update assignment status
  const updateAssignmentStatus = async (assignmentId, status) => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .update({ status })
        .eq('id', assignmentId);

      if (error) throw error;

      console.log("Assignment status updated:", data);
      return { success: true, data };
      
    } catch (err) {
      console.error('Error updating assignment status:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    editors,
    editorMetrics,
    isLoading,
    error,
    assignEditor,
    updateAssignmentStatus,
  };
}; 