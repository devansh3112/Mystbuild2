import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useBackup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Export user's manuscripts data
  const exportManuscriptsData = useCallback(async (format = 'json') => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Get user's manuscripts with all related data
      const { data: manuscripts, error: manuscriptsError } = await supabase
        .from('manuscripts')
        .select(`
          *,
          chapters (
            id,
            title,
            number,
            content,
            status,
            word_count,
            created_at,
            updated_at
          ),
          assignments (
            id,
            status,
            priority,
            deadline,
            assigned_date,
            notes,
            profiles:editor_id (
              name,
              email
            )
          ),
          reviews (
            id,
            content,
            rating,
            review_type,
            status,
            created_at,
            profiles:reviewer_id (
              name,
              role
            )
          )
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (manuscriptsError) {
        throw manuscriptsError;
      }

      const exportData = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        user_name: user.name,
        manuscripts: manuscripts || [],
        total_manuscripts: manuscripts?.length || 0
      };

      if (format === 'json') {
        downloadJSON(exportData, `manuscripts-backup-${new Date().toISOString().split('T')[0]}`);
      } else if (format === 'csv') {
        downloadCSV(manuscriptsToCSV(manuscripts), `manuscripts-${new Date().toISOString().split('T')[0]}`);
      }

      toast.success(`Manuscripts exported successfully as ${format.toUpperCase()}`);
      return exportData;

    } catch (err) {
      setError(err.message);
      toast.error(`Export failed: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Export all platform data (publishers only)
  const exportPlatformData = useCallback(async (format = 'json') => {
    if (!user || user.role !== 'publisher') {
      throw new Error('Only publishers can export platform data');
    }

    setLoading(true);
    setError(null);

    try {
      const [manuscripts, profiles, assignments, analytics] = await Promise.all([
        supabase.from('manuscripts').select('*').order('created_at'),
        supabase.from('profiles').select('*').order('created_at'),
        supabase.from('assignments').select('*').order('assigned_date'),
        supabase.from('platform_metrics').select('*').order('date')
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        exported_by: user.id,
        platform_data: {
          manuscripts: manuscripts.data || [],
          profiles: profiles.data || [],
          assignments: assignments.data || [],
          analytics: analytics.data || []
        },
        statistics: {
          total_manuscripts: manuscripts.data?.length || 0,
          total_users: profiles.data?.length || 0,
          total_assignments: assignments.data?.length || 0
        }
      };

      if (format === 'json') {
        downloadJSON(exportData, `platform-backup-${new Date().toISOString().split('T')[0]}`);
      }

      toast.success('Platform data exported successfully');
      return exportData;

    } catch (err) {
      setError(err.message);
      toast.error(`Export failed: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create automatic backup
  const createBackup = useCallback(async () => {
    if (!user) return;

    try {
      const backupData = await exportManuscriptsData('json');
      
      // Store backup metadata
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          action: 'backup_created',
          metadata: {
            backup_size: JSON.stringify(backupData).length,
            manuscript_count: backupData.total_manuscripts,
            backup_type: 'manual'
          }
        });

      return backupData;
    } catch (err) {
      console.error('Backup creation failed:', err);
      throw err;
    }
  }, [user, exportManuscriptsData]);

  // Restore from backup (basic version)
  const validateBackupFile = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // Validate backup structure
          const requiredFields = ['exported_at', 'user_id', 'manuscripts'];
          const isValid = requiredFields.every(field => data.hasOwnProperty(field));
          
          if (!isValid) {
            reject(new Error('Invalid backup file format'));
            return;
          }

          resolve({
            isValid: true,
            data,
            manuscriptCount: data.manuscripts?.length || 0,
            exportedAt: data.exported_at,
            originalUserId: data.user_id
          });
        } catch (err) {
          reject(new Error('Invalid JSON format'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, []);

  // Utility functions
  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const manuscriptsToCSV = (manuscripts) => {
    if (!manuscripts || manuscripts.length === 0) return '';

    const headers = [
      'ID', 'Title', 'Genre', 'Status', 'Word Count', 'Progress',
      'Created At', 'Updated At', 'Chapters Count', 'Reviews Count'
    ];

    const rows = manuscripts.map(manuscript => [
      manuscript.id,
      manuscript.title,
      manuscript.genre,
      manuscript.status,
      manuscript.word_count || 0,
      manuscript.progress || 0,
      manuscript.created_at,
      manuscript.updated_at,
      manuscript.chapters?.length || 0,
      manuscript.reviews?.length || 0
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(','))
      .join('\n');
  };

  return {
    loading,
    error,
    exportManuscriptsData,
    exportPlatformData,
    createBackup,
    validateBackupFile
  };
};

export default useBackup; 