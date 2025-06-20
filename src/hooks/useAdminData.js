import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to fetch admin dashboard data from Supabase
 * Initially uses feature flags to control data source (mock vs real)
 */
export const useAdminData = (options = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const { session, profile, user } = useAuth();
  
  // Feature flag to control whether we use real or mock data
  // This allows for gradual replacement of mock data
  const useRealData = options.useRealData || false;

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLoading) {
        console.log("Tab became visible again while loading - providing fallback data");
        // If we come back to the tab and we're still loading, use fallback data
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
    
    if (!dashboardData) {
      console.log("Providing fallback dashboard data");
      setDashboardData({
        metrics: {
          active_manuscripts: 24,
          active_editors: 8,
          completed_manuscripts: 18,
          avg_completion_days: 6.2,
          new_writers: 32,
          revenue: 8240,
          editor_capacity: 0.78,
          satisfaction_score: 4.8
        },
        history: [
          { metric_name: 'active_manuscripts', change_percent: 12 },
          { metric_name: 'active_editors', change_percent: 25 },
          { metric_name: 'revenue', change_percent: 12 },
          { metric_name: 'satisfaction', change_percent: 4.2 }
        ],
        manuscripts: [
          { 
            id: 1, 
            title: "The Silent Symphony", 
            profiles: { name: "Jason Patel" },
            status: "New", 
            submission_date: "2025-05-17T00:00:00",
            deadline: "2025-07-16T00:00:00"
          },
          { 
            id: 2, 
            title: "Echoes of Tomorrow", 
            profiles: { name: "Naomi Rodriguez" },
            status: "In Review", 
            submission_date: "2025-05-12T00:00:00",
            deadline: "2025-07-01T00:00:00"
          },
          { 
            id: 3, 
            title: "Quantum Dreams", 
            profiles: { name: "Lucia Martinez" },
            status: "In Review", 
            submission_date: "2025-05-02T00:00:00",
            deadline: "2025-06-16T00:00:00"
          },
          { 
            id: 4, 
            title: "The Mountain's Secret", 
            profiles: { name: "Samantha Clark" },
            status: "Editing", 
            submission_date: "2025-04-17T00:00:00",
            deadline: "2025-06-06T00:00:00"
          }
        ],
        editorMetrics: [
          {
            id: 1,
            profiles: { name: "Mark Davis" },
            assigned_count: 5,
            completed_count: 3,
            satisfaction_rating: 4.8,
            on_time_rate: 1.0
          },
          {
            id: 2,
            profiles: { name: "Priya Sharma" },
            assigned_count: 4,
            completed_count: 4,
            satisfaction_rating: 4.9,
            on_time_rate: 1.0
          },
          {
            id: 3,
            profiles: { name: "James Wilson" },
            assigned_count: 6,
            completed_count: 5,
            satisfaction_rating: 4.7,
            on_time_rate: 0.95
          }
        ]
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Debug authentication information
      console.log("Auth Debug:", { 
        hasSession: !!session,
        hasProfile: !!profile,
        profile,
        hasUser: !!user,
        userRole: user?.role,
        useRealData
      });
      
      // Require proper authentication for admin access
      if (!session || !user || user.role !== 'publisher') {
        console.log("Unauthorized access - No session or not publisher role");
        setError('Unauthorized access - Admin privileges required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Set a timeout to ensure loading state doesn't get stuck
        const timeoutId = setTimeout(() => {
          if (isLoading) {
            console.log("Loading timeout reached - using fallback data");
            provideFallbackData();
          }
        }, 3000); // Shorter 3 second timeout for better experience
        
        if (!useRealData) {
          // If not using real data, return early and let the existing mock data be used
          setIsLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        console.log("Starting to fetch data from Supabase");

        // Fetch the latest platform metrics
        const { data: metricsData, error: metricsError } = await supabase
          .from('platform_metrics')
          .select('*')
          .order('date', { ascending: false })
          .limit(1);

        console.log("Platform metrics:", metricsData, metricsError);

        if (metricsError) {
          console.log("Metrics error:", metricsError);
          throw metricsError;
        }

        // Fetch metric history data
        const { data: historyData, error: historyError } = await supabase
          .from('metric_history')
          .select('*')
          .order('date', { ascending: false })
          .limit(8);

        console.log("Metric history:", historyData, historyError);

        if (historyError) {
          console.log("History error:", historyError);
          throw historyError;
        }

        // Fetch recent manuscripts with proper profile field
        const { data: manuscriptsData, error: manuscriptsError } = await supabase
          .from('manuscripts')
          .select(`
            *,
            profiles:author_id(id, name, role)
          `)
          .order('submission_date', { ascending: false })
          .limit(10);
          
        console.log("Manuscripts:", manuscriptsData, manuscriptsError);

        if (manuscriptsError) {
          console.log("Manuscripts error:", manuscriptsError);
          throw manuscriptsError;
        }

        // Fetch editor metrics with proper profile field
        const { data: editorMetricsData, error: editorMetricsError } = await supabase
          .from('editor_metrics')
          .select(`
            *,
            profiles:editor_id(id, name, role)
          `)
          .order('month', { ascending: false });

        console.log("Editor metrics:", editorMetricsData, editorMetricsError);

        if (editorMetricsError) {
          console.log("Editor metrics error:", editorMetricsError);
          throw editorMetricsError;
        }

        console.log("All data fetched successfully");
        
        // Check visibility state before updating state
        if (document.visibilityState !== 'visible') {
          console.log("Tab not visible, using fallback data");
          clearTimeout(timeoutId);
          provideFallbackData();
          return;
        }
        
        // Compile the dashboard data
        const compiledData = {
          metrics: metricsData && metricsData.length > 0 ? metricsData[0] : {
            active_manuscripts: 0,
            active_editors: 0,
            completed_manuscripts: 0,
            avg_completion_days: 0,
            new_writers: 0,
            revenue: 0,
            editor_capacity: 0,
            satisfaction_score: 0
          },
          history: historyData || [],
          manuscripts: manuscriptsData || [],
          editorMetrics: editorMetricsData || []
        };
        
        console.log("Compiled dashboard data:", compiledData);
        
        setDashboardData(compiledData);
        clearTimeout(timeoutId);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err.message);
        provideFallbackData();
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Cleanup function to handle unmounting or dependency changes
    return () => {
      console.log("Cleaning up admin data fetch");
    };
  }, [session, profile, useRealData, user]);

  return {
    isLoading,
    error,
    dashboardData,
  };
}; 