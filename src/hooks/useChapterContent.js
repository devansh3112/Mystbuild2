import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useChapterContent = (chapterId) => {
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  // Fetch chapter content
  const fetchChapterContent = useCallback(async () => {
    if (!chapterId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('chapters')
        .select(`
          *,
          manuscripts:manuscript_id (
            id,
            title,
            author_id
          ),
          editor:last_edited_by (
            id,
            name,
            avatar_url
          )
        `)
        .eq('id', chapterId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setChapter(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching chapter content:', err);
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  // Update chapter content
  const updateChapterContent = useCallback(async (content) => {
    if (!chapterId || !user) {
      throw new Error('Chapter ID and user required');
    }

    setSaving(true);

    try {
      // Calculate word count
      const wordCount = content ? content.trim().split(/\s+/).filter(word => word.length > 0).length : 0;

      const updates = {
        content,
        word_count: wordCount,
        last_edited_at: new Date().toISOString(),
        last_edited_by: user.id
      };

      const { data, error } = await supabase
        .from('chapters')
        .update(updates)
        .eq('id', chapterId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setChapter(prev => ({ ...prev, ...data }));
      toast.success('Chapter content saved');
      return data;

    } catch (err) {
      toast.error(`Save failed: ${err.message}`);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [chapterId, user]);

  // Update chapter metadata (title, status, etc.)
  const updateChapterMetadata = useCallback(async (updates) => {
    if (!chapterId || !user) {
      throw new Error('Chapter ID and user required');
    }

    try {
      const { data, error } = await supabase
        .from('chapters')
        .update({
          ...updates,
          last_edited_at: new Date().toISOString(),
          last_edited_by: user.id
        })
        .eq('id', chapterId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setChapter(prev => ({ ...prev, ...data }));
      toast.success('Chapter updated');
      return data;

    } catch (err) {
      toast.error(`Update failed: ${err.message}`);
      throw err;
    }
  }, [chapterId, user]);

  // Update chapter title
  const updateChapterTitle = useCallback(async (title) => {
    return updateChapterMetadata({ title });
  }, [updateChapterMetadata]);

  // Update chapter status
  const updateChapterStatus = useCallback(async (status) => {
    // Update progress based on status
    let progress = 0;
    switch (status) {
      case 'Not Started':
        progress = 0;
        break;
      case 'In Review':
        progress = 50;
        break;
      case 'Reviewed':
        progress = 100;
        break;
      default:
        progress = chapter?.progress || 0;
    }

    return updateChapterMetadata({ status, progress });
  }, [updateChapterMetadata, chapter]);

  // Update chapter progress
  const updateChapterProgress = useCallback(async (progress) => {
    // Auto-update status based on progress
    let status = chapter?.status || 'Not Started';
    if (progress === 0) {
      status = 'Not Started';
    } else if (progress < 100) {
      status = 'In Review';
    } else {
      status = 'Reviewed';
    }

    return updateChapterMetadata({ progress, status });
  }, [updateChapterMetadata, chapter]);

  // Auto-save content with debouncing
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

  const autoSaveContent = useCallback((content) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(() => {
      updateChapterContent(content).catch(err => {
        console.error('Auto-save failed:', err);
      });
    }, 2000); // 2 second delay

    setAutoSaveTimeout(timeout);
  }, [updateChapterContent, autoSaveTimeout]);

  // Get chapter statistics
  const getChapterStats = useCallback(() => {
    if (!chapter) return null;

    return {
      wordCount: chapter.word_count || 0,
      characterCount: chapter.content ? chapter.content.length : 0,
      paragraphCount: chapter.content ? chapter.content.split('\n\n').filter(p => p.trim()).length : 0,
      lastEdited: chapter.last_edited_at,
      lastEditor: chapter.editor?.name || 'Unknown'
    };
  }, [chapter]);

  // Delete chapter
  const deleteChapter = useCallback(async () => {
    if (!chapterId || !user) {
      throw new Error('Chapter ID and user required');
    }

    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);

      if (error) {
        throw error;
      }

      toast.success('Chapter deleted');
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
      throw err;
    }
  }, [chapterId, user]);

  // Initial load
  useEffect(() => {
    fetchChapterContent();
  }, [fetchChapterContent]);

  // Real-time subscription for chapter updates
  useEffect(() => {
    if (!chapterId) return;

    const subscription = supabase
      .channel(`chapter-${chapterId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'chapters',
          filter: `id=eq.${chapterId}`
        }, 
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setChapter(prev => ({ ...prev, ...payload.new }));
          } else if (payload.eventType === 'DELETE') {
            setChapter(null);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chapterId]);

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  return {
    chapter,
    loading,
    error,
    saving,
    updateChapterContent,
    updateChapterMetadata,
    updateChapterTitle,
    updateChapterStatus,
    updateChapterProgress,
    autoSaveContent,
    getChapterStats,
    deleteChapter,
    refetch: fetchChapterContent
  };
};

export default useChapterContent; 