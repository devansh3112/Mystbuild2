import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to fetch detailed manuscript data from Supabase
 * Includes manuscript info, chapters, and related profiles
 */
export const useManuscript = (manuscriptId, options = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manuscript, setManuscript] = useState(null);
  const { session, user } = useAuth();
  
  // Feature flag to control whether we use real or mock data
  const useRealData = options.useRealData || false;

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLoading) {
        console.log("Tab became visible while loading manuscript - providing fallback data");
        provideFallbackData(manuscriptId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoading, manuscriptId]);

  // Helper function to provide fallback data when needed
  const provideFallbackData = (id) => {
    console.log("Unable to load manuscript data for ID:", id);
    setError("Unable to load manuscript data");
    setIsLoading(false);
    
    // For production, don't provide mock data - set to null
    setManuscript(null);
  };

  useEffect(() => {
    const fetchManuscript = async () => {
      if (!manuscriptId) {
        setError("No manuscript ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Set a timeout to ensure loading state doesn't get stuck
        const timeoutId = setTimeout(() => {
          if (isLoading) {
            console.log("Loading timeout reached - using fallback data");
            provideFallbackData(manuscriptId);
          }
        }, 3000); // 3 second timeout
        
        if (!useRealData) {
          // If not using real data, return early and use fallback data
          provideFallbackData(manuscriptId);
          clearTimeout(timeoutId);
          return;
        }

        console.log("Fetching manuscript data for ID:", manuscriptId);

        // Fetch the manuscript with author profile (no email field in profiles)
        const { data: manuscriptData, error: manuscriptError } = await supabase
          .from('manuscripts')
          .select(`
            *,
            author:profiles!manuscripts_author_id_fkey(id, name, role, avatar_url),
            editor:profiles!manuscripts_editor_id_fkey(id, name, role, avatar_url)
          `)
          .eq('id', manuscriptId)
          .single();

        console.log("Manuscript data:", manuscriptData, manuscriptError);

        if (manuscriptError) {
          console.log("Manuscript error:", manuscriptError);
          throw manuscriptError;
        }

        // Fetch chapters for this manuscript
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('*')
          .eq('manuscript_id', manuscriptId)
          .order('number', { ascending: true });

        console.log("Chapters data:", chaptersData, chaptersError);

        if (chaptersError) {
          console.log("Chapters error:", chaptersError);
          throw chaptersError;
        }

        // Fetch reviews for this manuscript
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('manuscript_reviews')
          .select(`
            *,
            reviewer:profiles(*)
          `)
          .eq('manuscript_id', manuscriptId)
          .order('date', { ascending: false });

        console.log("Reviews data:", reviewsData, reviewsError);

        if (reviewsError) {
          console.log("Reviews error:", reviewsError);
          throw reviewsError;
        }

        // Check visibility state before updating state
        if (document.visibilityState !== 'visible') {
          console.log("Tab not visible, using fallback data");
          clearTimeout(timeoutId);
          provideFallbackData(manuscriptId);
          return;
        }
        
        // Compile the manuscript data
        const compiledManuscript = {
          ...manuscriptData,
          chapters: (chaptersData || []).map(chapter => ({
            ...chapter,
            // Add feedback field with empty string since it doesn't exist in the database
            feedback: '',
            // Add content field since it doesn't exist in the database
            content: 'Chapter content will be loaded separately.'
          })),
          reviews: reviewsData || []
        };
        
        console.log("Compiled manuscript data:", compiledManuscript);
        
        setManuscript(compiledManuscript);
        clearTimeout(timeoutId);
      } catch (err) {
        console.error('Error fetching manuscript data:', err);
        setError(err.message);
        provideFallbackData(manuscriptId);
      } finally {
        setIsLoading(false);
      }
    };

    fetchManuscript();
    
    return () => {
      console.log("Cleaning up manuscript data fetch");
    };
  }, [manuscriptId, session, useRealData, user]);

  return {
    isLoading,
    error,
    manuscript,
  };
}; 