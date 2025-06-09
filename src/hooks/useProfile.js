import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to manage user profile data and operations
 * Handles profile viewing, editing, and role-specific data
 */
export const useProfile = (profileId = null, options = {}) => {
  const [profile, setProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, session } = useAuth();
  
  // Feature flag to control whether we use real or mock data
  const useRealData = options.useRealData || false;
  
  // Options
  const fetchList = options.fetchList || false;
  const role = options.role || null; // Filter by role when fetching list

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLoading) {
        console.log("Tab became visible while loading profiles - providing fallback data");
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
    console.log("Providing fallback profile data");
    setError("Unable to load profile data");
    setIsLoading(false);
    
    // For production, don't provide mock data - use empty states
    if (fetchList) {
      setProfiles([]);
      console.log("No profiles available");
    }

    if (profileId || (!fetchList && user)) {
      setProfile(null);
      console.log("No profile data available");
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        
        // Set a timeout to ensure loading state doesn't get stuck
        const timeoutId = setTimeout(() => {
          if (isLoading) {
            console.log("Profile loading timeout reached - using fallback data");
            provideFallbackData();
          }
        }, 3000); // 3 second timeout
        
        if (!useRealData) {
          // If not using real data, return early and use fallback data
          provideFallbackData();
          clearTimeout(timeoutId);
          return;
        }

        console.log("Fetching profile data");

        if (fetchList) {
          // Fetch list of profiles
          let query = supabase.from('profiles').select('*');
          
          if (role) {
            query = query.eq('role', role);
          }
          
          const { data: profilesData, error: profilesError } = await query
            .eq('active', true)
            .order('created_at', { ascending: false });

          console.log("Profiles data:", profilesData, profilesError);

          if (profilesError) {
            console.log("Profiles error:", profilesError);
            throw profilesError;
          }

          setProfiles(profilesData || []);
        }

        if (profileId || (!fetchList && user)) {
          // Fetch specific profile
          const targetId = profileId || user?.id;
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', targetId)
            .single();

          console.log("Profile data:", profileData, profileError);

          if (profileError) {
            console.log("Profile error:", profileError);
            throw profileError;
          }

          setProfile(profileData);
        }

        // Check visibility state before updating state
        if (document.visibilityState !== 'visible') {
          console.log("Tab not visible, using fallback data");
          clearTimeout(timeoutId);
          provideFallbackData();
          return;
        }
        
        clearTimeout(timeoutId);
        
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err.message);
        provideFallbackData();
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
    
    return () => {
      console.log("Cleaning up profile data fetch");
    };
  }, [session, useRealData, user, profileId, fetchList, role]);

  // Function to update profile
  const updateProfile = async (updatedData) => {
    try {
      const targetId = profileId || user?.id;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', targetId)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      console.log("Profile updated successfully:", data);
      return { success: true, data };
      
    } catch (err) {
      console.error('Error updating profile:', err);
      return { success: false, error: err.message };
    }
  };

  // Function to create new profile
  const createProfile = async (newProfileData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfileData])
        .select()
        .single();

      if (error) throw error;

      console.log("Profile created successfully:", data);
      return { success: true, data };
      
    } catch (err) {
      console.error('Error creating profile:', err);
      return { success: false, error: err.message };
    }
  };

  // Function to deactivate profile
  const deactivateProfile = async (targetId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ active: false })
        .eq('id', targetId);

      if (error) throw error;

      console.log("Profile deactivated successfully:", data);
      return { success: true, data };
      
    } catch (err) {
      console.error('Error deactivating profile:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    profile,
    profiles,
    isLoading,
    error,
    updateProfile,
    createProfile,
    deactivateProfile,
  };
}; 