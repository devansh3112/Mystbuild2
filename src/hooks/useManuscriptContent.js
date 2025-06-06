import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useManuscriptContent = (manuscriptId) => {
  const [manuscript, setManuscript] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch manuscript with content and uploads
  const fetchManuscriptContent = useCallback(async () => {
    if (!manuscriptId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch manuscript data
      const { data: manuscriptData, error: manuscriptError } = await supabase
        .from('manuscripts')
        .select(`
          *,
          profiles:author_id (
            id,
            name,
            role,
            avatar_url
          )
        `)
        .eq('id', manuscriptId)
        .single();

      if (manuscriptError) {
        throw manuscriptError;
      }

      setManuscript(manuscriptData);

      // Fetch related uploads
      const { data: uploadsData, error: uploadsError } = await supabase
        .from('uploads')
        .select('*')
        .eq('manuscript_id', manuscriptId)
        .order('created_at', { ascending: false });

      if (uploadsError) {
        throw uploadsError;
      }

      setUploads(uploadsData || []);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching manuscript content:', err);
    } finally {
      setLoading(false);
    }
  }, [manuscriptId]);

  // Update manuscript content fields
  const updateManuscriptContent = useCallback(async (updates) => {
    if (!manuscriptId || !user) {
      throw new Error('Manuscript ID and user required');
    }

    try {
      const { data, error } = await supabase
        .from('manuscripts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', manuscriptId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setManuscript(prev => ({ ...prev, ...data }));
      toast.success('Manuscript updated successfully');
      return data;

    } catch (err) {
      toast.error(`Update failed: ${err.message}`);
      throw err;
    }
  }, [manuscriptId, user]);

  // Update manuscript synopsis
  const updateSynopsis = useCallback(async (synopsis) => {
    return updateManuscriptContent({ synopsis });
  }, [updateManuscriptContent]);

  // Update manuscript content URL after file upload
  const updateContentUrl = useCallback(async (contentUrl, filename, fileSize) => {
    return updateManuscriptContent({ 
      content_url: contentUrl,
      original_filename: filename,
      file_size: fileSize
    });
  }, [updateManuscriptContent]);

  // Update cover image
  const updateCoverImage = useCallback(async (coverImageUrl) => {
    return updateManuscriptContent({ cover_image_url: coverImageUrl });
  }, [updateManuscriptContent]);

  // Calculate total word count from chapters
  const calculateTotalWordCount = useCallback(async () => {
    if (!manuscriptId) return 0;

    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('word_count')
        .eq('manuscript_id', manuscriptId);

      if (error) {
        throw error;
      }

      const totalWords = data.reduce((sum, chapter) => sum + (chapter.word_count || 0), 0);
      
      // Update manuscript with total word count
      await updateManuscriptContent({ word_count: totalWords });
      
      return totalWords;
    } catch (err) {
      console.error('Error calculating word count:', err);
      return 0;
    }
  }, [manuscriptId, updateManuscriptContent]);

  // Get signed URL for file download
  const getFileDownloadUrl = useCallback(async (storagePath) => {
    if (!storagePath) return null;

    try {
      const { data, error } = await supabase.storage
        .from('manuscripts')
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (error) {
        throw error;
      }

      return data.signedUrl;
    } catch (err) {
      console.error('Error getting download URL:', err);
      toast.error('Failed to generate download link');
      return null;
    }
  }, []);

  // Delete manuscript and all associated files
  const deleteManuscript = useCallback(async () => {
    if (!manuscriptId || !user) {
      throw new Error('Manuscript ID and user required');
    }

    try {
      // Delete all associated uploads from storage
      for (const upload of uploads) {
        try {
          await supabase.storage
            .from(upload.storage_path.includes('covers') ? 'covers' : 'manuscripts')
            .remove([upload.storage_path]);
        } catch (storageError) {
          console.warn('Failed to delete file from storage:', storageError);
        }
      }

      // Delete uploads records
      await supabase
        .from('uploads')
        .delete()
        .eq('manuscript_id', manuscriptId);

      // Delete chapters
      await supabase
        .from('chapters')
        .delete()
        .eq('manuscript_id', manuscriptId);

      // Delete assignments
      await supabase
        .from('assignments')
        .delete()
        .eq('manuscript_id', manuscriptId);

      // Delete manuscript
      const { error } = await supabase
        .from('manuscripts')
        .delete()
        .eq('id', manuscriptId);

      if (error) {
        throw error;
      }

      toast.success('Manuscript deleted successfully');

    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
      throw err;
    }
  }, [manuscriptId, user, uploads]);

  // Initial load
  useEffect(() => {
    fetchManuscriptContent();
  }, [fetchManuscriptContent]);

  // Set up real-time subscription for manuscript updates
  useEffect(() => {
    if (!manuscriptId) return;

    const subscription = supabase
      .channel(`manuscript-${manuscriptId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'manuscripts',
          filter: `id=eq.${manuscriptId}`
        }, 
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setManuscript(prev => ({ ...prev, ...payload.new }));
          } else if (payload.eventType === 'DELETE') {
            setManuscript(null);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [manuscriptId]);

  return {
    manuscript,
    uploads,
    loading,
    error,
    updateManuscriptContent,
    updateSynopsis,
    updateContentUrl,
    updateCoverImage,
    calculateTotalWordCount,
    getFileDownloadUrl,
    deleteManuscript,
    refetch: fetchManuscriptContent
  };
};

export default useManuscriptContent; 