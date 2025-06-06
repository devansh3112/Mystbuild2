import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const SimpleManuscriptTest = () => {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting simple manuscript fetch...');
        
        // Simple query without complex joins
        const { data, error } = await supabase
          .from('manuscripts')
          .select('*')
          .limit(10);
          
        if (error) {
          console.error('Error:', error);
          throw error;
        }
        
        console.log('Data received:', data);
        setManuscripts(data || []);
        
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Simple Manuscript Test</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Simple Manuscript Test</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Manuscript Test</h1>
      <p className="mb-4">Found {manuscripts.length} manuscripts</p>
      
      <div className="grid gap-4">
        {manuscripts.map((manuscript) => (
          <div key={manuscript.id} className="border rounded p-4 bg-white shadow">
            <h3 className="font-semibold text-lg">{manuscript.title}</h3>
            <p className="text-gray-600">Genre: {manuscript.genre}</p>
            <p className="text-gray-600">Status: {manuscript.status}</p>
            <p className="text-gray-600">Word Count: {manuscript.word_count?.toLocaleString()}</p>
            <p className="text-gray-600">Created: {new Date(manuscript.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
      
      {manuscripts.length === 0 && (
        <p className="text-gray-500 italic">No manuscripts found.</p>
      )}
    </div>
  );
};

export default SimpleManuscriptTest; 