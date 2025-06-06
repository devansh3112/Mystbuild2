import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for chapter-related mutations (create, update, delete)
 * Handles chapter status updates, progress tracking, and feedback
 */
export const useChapterMutations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Update chapter status
  const updateChapterStatus = async (chapterId, status, progress = null) => {
    try {
      setIsLoading(true);
      setError(null);

      const updateData = { status };
      if (progress !== null) {
        updateData.progress = progress;
      }

      const { data, error: updateError } = await supabase
        .from('chapters')
        .update(updateData)
        .eq('id', chapterId)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log("Chapter status updated successfully:", data);
      return { success: true, data };

    } catch (err) {
      console.error('Error updating chapter status:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Update chapter progress
  const updateChapterProgress = async (chapterId, progress) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('chapters')
        .update({ progress })
        .eq('id', chapterId)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log("Chapter progress updated successfully:", data);
      return { success: true, data };

    } catch (err) {
      console.error('Error updating chapter progress:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Add chapter feedback (if we add a feedback column later)
  const addChapterFeedback = async (chapterId, feedback) => {
    try {
      setIsLoading(true);
      setError(null);

      // For now, we'll store feedback in a comments table or similar
      // Since the current schema doesn't have a feedback field
      console.log("Feedback functionality would be implemented here");
      
      // Placeholder implementation - could use a separate feedback/comments table
      return { success: true, message: "Feedback feature not yet implemented in database schema" };

    } catch (err) {
      console.error('Error adding chapter feedback:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Create new chapter
  const createChapter = async (manuscriptId, chapterData) => {
    try {
      setIsLoading(true);
      setError(null);

      const newChapter = {
        manuscript_id: manuscriptId,
        title: chapterData.title,
        number: chapterData.number,
        status: chapterData.status || 'pending',
        progress: chapterData.progress || 0,
        ...chapterData
      };

      const { data, error: insertError } = await supabase
        .from('chapters')
        .insert([newChapter])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log("Chapter created successfully:", data);
      return { success: true, data };

    } catch (err) {
      console.error('Error creating chapter:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Delete chapter
  const deleteChapter = async (chapterId) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: deleteError } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId)
        .select()
        .single();

      if (deleteError) throw deleteError;

      console.log("Chapter deleted successfully:", data);
      return { success: true, data };

    } catch (err) {
      console.error('Error deleting chapter:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Batch update multiple chapters
  const batchUpdateChapters = async (updates) => {
    try {
      setIsLoading(true);
      setError(null);

      const results = [];
      
      for (const update of updates) {
        const { chapterId, ...updateData } = update;
        
        const { data, error: updateError } = await supabase
          .from('chapters')
          .update(updateData)
          .eq('id', chapterId)
          .select()
          .single();

        if (updateError) throw updateError;
        results.push(data);
      }

      console.log("Batch chapter updates completed:", results);
      return { success: true, data: results };

    } catch (err) {
      console.error('Error in batch chapter updates:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    updateChapterStatus,
    updateChapterProgress,
    addChapterFeedback,
    createChapter,
    deleteChapter,
    batchUpdateChapters,
  };
}; 