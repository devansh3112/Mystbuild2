import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to fetch manuscript lists appropriate for the current user's role
 * Writers see their own manuscripts
 * Editors see manuscripts assigned to them
 * Publishers see all manuscripts
 */
export const useManuscriptList = (options = {}) => {
  const [manuscripts, setManuscripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, session } = useAuth();
  
  // Feature flag to control whether we use real or mock data
  const useRealData = options.useRealData || false;
  
  // Filter options
  const status = options.status || null;
  const limit = options.limit || 50;
  const orderBy = options.orderBy || 'submission_date';
  const orderDirection = options.orderDirection || { ascending: false };

  useEffect(() => {
    if (!useRealData || !user) {
      // If not using real data or no auth, return early to let mock data be used
      setIsLoading(false);
      setManuscripts([]);
      return;
    }

    const fetchManuscripts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching manuscripts for user:', user.role, user.id);
        
        // Simplified query - let's start with just the basic manuscript data
        let query = supabase.from('manuscripts').select(`
          *,
          profiles:author_id(name)
        `);
        
        // Apply role-specific filters
        if (user.role === 'writer') {
          // Writers see only their manuscripts
          query = query.eq('author_id', user.id);
        }
        // Publishers and editors see all for now
        
        // Apply status filter if provided
        if (status) {
          query = query.eq('status', status);
        }
        
        // Apply sorting and limits
        query = query.order(orderBy, { ascending: orderDirection.ascending }).limit(limit);
        
        console.log('Executing query...');
        const { data, error: fetchError } = await query;
        
        if (fetchError) {
          console.error('Supabase query error:', fetchError);
          throw fetchError;
        }
        
        console.log('Query successful, data:', data);
        
        if (!data) {
          setManuscripts([]);
          return;
        }
        
        // Process the data to format it properly
        const processedData = data.map(manuscript => ({
          ...manuscript,
          author: manuscript.profiles ? manuscript.profiles.name : 'Unknown',
          editor: 'To be determined', // Simplified for now
          editorId: null,
          assignmentStatus: null,
          displayStatus: manuscript.status
        }));
        
        setManuscripts(processedData);
        console.log('Processed manuscripts:', processedData.length, 'items');
        
      } catch (err) {
        console.error('Error fetching manuscripts:', err);
        setError(err.message);
        setManuscripts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchManuscripts();
  }, [user?.id, user?.role, useRealData, status, limit, orderBy, orderDirection?.ascending]);

  return {
    manuscripts,
    isLoading,
    error,
  };
}; 