import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const { user } = useAuth();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mystery-publishers-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchTerm, filters, resultCount) => {
    const search = {
      term: searchTerm,
      filters,
      resultCount,
      timestamp: new Date().toISOString()
    };

    const updated = [search, ...recentSearches.filter(s => s.term !== searchTerm)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('mystery-publishers-recent-searches', JSON.stringify(updated));
  }, [recentSearches]);

  // Search manuscripts with advanced filtering
  const searchManuscripts = useCallback(async (searchTerm = '', filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('manuscripts')
        .select(`
          *,
          profiles:author_id (
            id,
            name,
            avatar_url
          ),
          assignments!left (
            id,
            editor_id,
            status,
            profiles:editor_id (
              name
            )
          )
        `);

      // Apply text search
      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,genre.ilike.%${searchTerm}%`);
      }

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.genre && filters.genre !== 'all') {
        query = query.eq('genre', filters.genre);
      }

      if (filters.authorId) {
        query = query.eq('author_id', filters.authorId);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters.wordCountMin) {
        query = query.gte('word_count', filters.wordCountMin);
      }

      if (filters.wordCountMax) {
        query = query.lte('word_count', filters.wordCountMax);
      }

      if (filters.assignedToEditor) {
        query = query.filter('assignments.editor_id', 'eq', filters.assignedToEditor);
      }

      if (filters.unassigned) {
        query = query.is('assignments', null);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error: searchError } = await query;

      if (searchError) {
        throw searchError;
      }

      setResults(data || []);

      // Save search if it has a term
      if (searchTerm.trim()) {
        saveRecentSearch(searchTerm, filters, data?.length || 0);
      }

      return data || [];

    } catch (err) {
      setError(err.message);
      console.error('Error searching manuscripts:', err);
      toast.error(`Search failed: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, [saveRecentSearch]);

  // Search users (editors, writers)
  const searchUsers = useCallback(async (searchTerm = '', filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          editor_skills!left (
            skill_name,
            proficiency_level
          ),
          editor_availability!left (
            max_concurrent_projects,
            current_workload
          ),
          assignments!editor_id (
            id,
            status,
            manuscripts (
              title
            )
          )
        `);

      // Apply text search
      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`);
      }

      // Apply filters
      if (filters.role && filters.role !== 'all') {
        query = query.eq('role', filters.role);
      }

      if (filters.availabilityStatus) {
        query = query.eq('availability_status', filters.availabilityStatus);
      }

      if (filters.specialties && filters.specialties.length > 0) {
        query = query.overlaps('specialties', filters.specialties);
      }

      if (filters.minRating) {
        query = query.gte('average_rating', filters.minRating);
      }

      if (filters.minExperience) {
        query = query.gte('years_experience', filters.minExperience);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error: searchError } = await query;

      if (searchError) {
        throw searchError;
      }

      setResults(data || []);
      return data || [];

    } catch (err) {
      setError(err.message);
      console.error('Error searching users:', err);
      toast.error(`Search failed: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Search assignments
  const searchAssignments = useCallback(async (searchTerm = '', filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('assignments')
        .select(`
          *,
          manuscripts:manuscript_id (
            id,
            title,
            genre,
            status,
            profiles:author_id (
              name
            )
          ),
          profiles:editor_id (
            id,
            name,
            avatar_url
          )
        `);

      // Apply text search through manuscript title or editor name
      if (searchTerm.trim()) {
        // This requires a custom approach since we're searching across related tables
        const { data: manuscripts } = await supabase
          .from('manuscripts')
          .select('id')
          .ilike('title', `%${searchTerm}%`);

        const { data: editors } = await supabase
          .from('profiles')
          .select('id')
          .ilike('name', `%${searchTerm}%`)
          .eq('role', 'editor');

        const manuscriptIds = manuscripts?.map(m => m.id) || [];
        const editorIds = editors?.map(e => e.id) || [];

        if (manuscriptIds.length > 0 || editorIds.length > 0) {
          const conditions = [];
          if (manuscriptIds.length > 0) {
            conditions.push(`manuscript_id.in.(${manuscriptIds.join(',')})`);
          }
          if (editorIds.length > 0) {
            conditions.push(`editor_id.in.(${editorIds.join(',')})`);
          }
          query = query.or(conditions.join(','));
        } else {
          // No matches found, return empty results
          setResults([]);
          return [];
        }
      }

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }

      if (filters.editorId) {
        query = query.eq('editor_id', filters.editorId);
      }

      if (filters.manuscriptId) {
        query = query.eq('manuscript_id', filters.manuscriptId);
      }

      if (filters.assignmentType && filters.assignmentType !== 'all') {
        query = query.eq('assignment_type', filters.assignmentType);
      }

      if (filters.deadlineFrom) {
        query = query.gte('deadline', filters.deadlineFrom);
      }

      if (filters.deadlineTo) {
        query = query.lte('deadline', filters.deadlineTo);
      }

      if (filters.overdue) {
        query = query.lt('deadline', new Date().toISOString());
        query = query.neq('status', 'completed');
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'assigned_date';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error: searchError } = await query;

      if (searchError) {
        throw searchError;
      }

      setResults(data || []);
      return data || [];

    } catch (err) {
      setError(err.message);
      console.error('Error searching assignments:', err);
      toast.error(`Search failed: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Universal search across multiple tables
  const universalSearch = useCallback(async (searchTerm = '', options = {}) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return { manuscripts: [], users: [], assignments: [] };
    }

    setLoading(true);
    setError(null);

    try {
      const [manuscripts, users, assignments] = await Promise.all([
        searchManuscripts(searchTerm, { limit: options.manuscriptLimit || 10 }),
        searchUsers(searchTerm, { limit: options.userLimit || 10 }),
        searchAssignments(searchTerm, { limit: options.assignmentLimit || 10 })
      ]);

      const universalResults = {
        manuscripts,
        users,
        assignments,
        total: manuscripts.length + users.length + assignments.length
      };

      setResults(universalResults);
      return universalResults;

    } catch (err) {
      setError(err.message);
      console.error('Error in universal search:', err);
      return { manuscripts: [], users: [], assignments: [] };
    } finally {
      setLoading(false);
    }
  }, [searchManuscripts, searchUsers, searchAssignments]);

  // Get search suggestions based on recent searches and popular terms
  const getSearchSuggestions = useCallback((currentTerm = '') => {
    if (!currentTerm.trim()) {
      return recentSearches.slice(0, 5).map(search => ({
        term: search.term,
        type: 'recent',
        resultCount: search.resultCount
      }));
    }

    // Filter recent searches by current term
    const matchingRecent = recentSearches
      .filter(search => 
        search.term.toLowerCase().includes(currentTerm.toLowerCase())
      )
      .slice(0, 3)
      .map(search => ({
        term: search.term,
        type: 'recent',
        resultCount: search.resultCount
      }));

    // Add some predefined suggestions
    const predefinedSuggestions = [
      'mystery', 'fiction', 'romance', 'sci-fi', 'fantasy', 'thriller',
      'draft', 'published', 'under review', 'rejected'
    ].filter(term => 
      term.toLowerCase().includes(currentTerm.toLowerCase()) &&
      !matchingRecent.some(recent => recent.term === term)
    ).slice(0, 3).map(term => ({
      term,
      type: 'suggestion'
    }));

    return [...matchingRecent, ...predefinedSuggestions];
  }, [recentSearches]);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('mystery-publishers-recent-searches');
  }, []);

  // Get available filter options
  const getFilterOptions = useCallback(async () => {
    try {
      const [genresData, statusData, editorsData] = await Promise.all([
        supabase.from('manuscripts').select('genre').not('genre', 'is', null),
        supabase.from('manuscripts').select('status').not('status', 'is', null),
        supabase.from('profiles').select('id, name').eq('role', 'editor')
      ]);

      const genres = [...new Set(genresData.data?.map(m => m.genre))].sort();
      const statuses = [...new Set(statusData.data?.map(m => m.status))].sort();
      const editors = editorsData.data || [];

      return {
        genres: genres.map(genre => ({ value: genre, label: genre })),
        statuses: statuses.map(status => ({ value: status, label: status })),
        editors: editors.map(editor => ({ value: editor.id, label: editor.name }))
      };
    } catch (err) {
      console.error('Error fetching filter options:', err);
      return { genres: [], statuses: [], editors: [] };
    }
  }, []);

  // Memoized search statistics
  const searchStats = useMemo(() => {
    if (!Array.isArray(results)) return null;

    return {
      totalResults: results.length,
      recentSearchCount: recentSearches.length,
      lastSearchTime: recentSearches[0]?.timestamp
    };
  }, [results, recentSearches]);

  return {
    results,
    loading,
    error,
    recentSearches,
    searchStats,
    searchManuscripts,
    searchUsers,
    searchAssignments,
    universalSearch,
    getSearchSuggestions,
    getFilterOptions,
    clearRecentSearches
  };
};

export default useSearch; 