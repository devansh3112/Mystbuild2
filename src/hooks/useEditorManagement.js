import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useEditorManagement = () => {
  const [editors, setEditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch all editors with their details
  const fetchEditors = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          editor_availability!left (
            available_from,
            available_until,
            max_concurrent_projects,
            current_workload
          ),
          editor_skills!left (
            skill_name,
            proficiency_level,
            years_experience
          ),
          assignments!editor_id (
            id,
            status,
            manuscript_id,
            manuscripts (
              title,
              status
            )
          )
        `)
        .eq('role', 'editor');

      // Apply filters
      if (filters.availability_status) {
        query = query.eq('availability_status', filters.availability_status);
      }

      if (filters.specialties && filters.specialties.length > 0) {
        query = query.overlaps('specialties', filters.specialties);
      }

      if (filters.min_rating) {
        query = query.gte('average_rating', filters.min_rating);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Calculate current workload and availability for each editor
      const editorsWithMetrics = data.map(editor => {
        const activeAssignments = editor.assignments?.filter(a => 
          ['assigned', 'in_progress'].includes(a.status)
        ) || [];

        const currentWorkload = activeAssignments.length;
        const maxProjects = editor.editor_availability?.[0]?.max_concurrent_projects || 3;
        const isAvailable = currentWorkload < maxProjects && editor.availability_status === 'available';

        return {
          ...editor,
          current_workload: currentWorkload,
          max_concurrent_projects: maxProjects,
          is_available: isAvailable,
          active_assignments_count: activeAssignments.length
        };
      });

      setEditors(editorsWithMetrics);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching editors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new editor profile
  const createEditor = useCallback(async (editorData) => {
    if (!user || user.role !== 'publisher') {
      throw new Error('Only publishers can create editor profiles');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          ...editorData,
          role: 'editor',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create initial availability record
      if (editorData.max_concurrent_projects) {
        await supabase
          .from('editor_availability')
          .insert({
            editor_id: data.id,
            max_concurrent_projects: editorData.max_concurrent_projects,
            current_workload: 0
          });
      }

      // Add skills if provided
      if (editorData.skills && editorData.skills.length > 0) {
        const skillsData = editorData.skills.map(skill => ({
          editor_id: data.id,
          skill_name: skill.name,
          proficiency_level: skill.level || 'intermediate',
          years_experience: skill.experience || 0
        }));

        await supabase
          .from('editor_skills')
          .insert(skillsData);
      }

      await fetchEditors(); // Refresh the list
      toast.success('Editor created successfully');
      return data;

    } catch (err) {
      toast.error(`Failed to create editor: ${err.message}`);
      throw err;
    }
  }, [user, fetchEditors]);

  // Update editor profile
  const updateEditor = useCallback(async (editorId, updates) => {
    if (!user || user.role !== 'publisher') {
      throw new Error('Only publishers can update editor profiles');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', editorId)
        .eq('role', 'editor')
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update availability if provided
      if (updates.max_concurrent_projects !== undefined) {
        await supabase
          .from('editor_availability')
          .upsert({
            editor_id: editorId,
            max_concurrent_projects: updates.max_concurrent_projects
          });
      }

      await fetchEditors(); // Refresh the list
      toast.success('Editor updated successfully');
      return data;

    } catch (err) {
      toast.error(`Failed to update editor: ${err.message}`);
      throw err;
    }
  }, [user, fetchEditors]);

  // Assign editor to manuscript
  const assignEditor = useCallback(async (manuscriptId, editorId, assignmentData = {}) => {
    if (!user || user.role !== 'publisher') {
      throw new Error('Only publishers can assign editors');
    }

    try {
      // Check if editor is available
      const editor = editors.find(e => e.id === editorId);
      if (!editor?.is_available) {
        throw new Error('Editor is not available for new assignments');
      }

      // Create assignment
      const assignment = {
        manuscript_id: manuscriptId,
        editor_id: editorId,
        status: 'assigned',
        priority: assignmentData.priority || 'Medium',
        deadline: assignmentData.deadline,
        assignment_type: assignmentData.type || 'editing',
        estimated_hours: assignmentData.estimatedHours,
        hourly_rate: assignmentData.hourlyRate || editor.hourly_rate,
        notes: assignmentData.notes,
        assigned_date: new Date().toISOString()
      };

      if (assignment.estimated_hours && assignment.hourly_rate) {
        assignment.total_cost = assignment.estimated_hours * assignment.hourly_rate;
      }

      const { data, error } = await supabase
        .from('assignments')
        .insert(assignment)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update editor's current workload
      await supabase
        .from('editor_availability')
        .update({
          current_workload: supabase.raw('current_workload + 1')
        })
        .eq('editor_id', editorId);

      await fetchEditors(); // Refresh the list
      toast.success('Editor assigned successfully');
      return data;

    } catch (err) {
      toast.error(`Failed to assign editor: ${err.message}`);
      throw err;
    }
  }, [user, editors, fetchEditors]);

  // Remove editor assignment
  const removeAssignment = useCallback(async (assignmentId) => {
    if (!user || user.role !== 'publisher') {
      throw new Error('Only publishers can remove assignments');
    }

    try {
      // Get assignment details first
      const { data: assignment, error: fetchError } = await supabase
        .from('assignments')
        .select('editor_id')
        .eq('id', assignmentId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Delete assignment
      const { error: deleteError } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (deleteError) {
        throw deleteError;
      }

      // Update editor's workload
      await supabase
        .from('editor_availability')
        .update({
          current_workload: supabase.raw('GREATEST(current_workload - 1, 0)')
        })
        .eq('editor_id', assignment.editor_id);

      await fetchEditors(); // Refresh the list
      toast.success('Assignment removed successfully');

    } catch (err) {
      toast.error(`Failed to remove assignment: ${err.message}`);
      throw err;
    }
  }, [user, fetchEditors]);

  // Update editor availability status
  const updateAvailabilityStatus = useCallback(async (editorId, status) => {
    if (!user || user.role !== 'publisher') {
      throw new Error('Only publishers can update editor availability');
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ availability_status: status })
        .eq('id', editorId)
        .eq('role', 'editor');

      if (error) {
        throw error;
      }

      await fetchEditors(); // Refresh the list
      toast.success(`Editor status updated to ${status}`);

    } catch (err) {
      toast.error(`Failed to update status: ${err.message}`);
      throw err;
    }
  }, [user, fetchEditors]);

  // Get editor performance metrics
  const getEditorMetrics = useCallback(async (editorId, months = 3) => {
    try {
      const { data, error } = await supabase
        .from('editor_metrics')
        .select('*')
        .eq('editor_id', editorId)
        .gte('month', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('month', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error fetching editor metrics:', err);
      return [];
    }
  }, []);

  // Search editors
  const searchEditors = useCallback(async (searchTerm) => {
    if (!searchTerm) {
      await fetchEditors();
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          editor_availability!left (
            available_from,
            available_until,
            max_concurrent_projects,
            current_workload
          ),
          editor_skills!left (
            skill_name,
            proficiency_level,
            years_experience
          )
        `)
        .eq('role', 'editor')
        .or(`name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
        .order('name');

      if (error) {
        throw error;
      }

      setEditors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchEditors();
  }, [fetchEditors]);

  return {
    editors,
    loading,
    error,
    fetchEditors,
    createEditor,
    updateEditor,
    assignEditor,
    removeAssignment,
    updateAvailabilityStatus,
    getEditorMetrics,
    searchEditors
  };
};

export default useEditorManagement; 