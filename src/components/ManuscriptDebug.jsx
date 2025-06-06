import React from 'react';
import { useManuscriptList } from '@/hooks/useManuscriptList';
import { useAuth } from '@/contexts/AuthContext';

const ManuscriptDebug = () => {
  const { user } = useAuth();
  const { manuscripts, isLoading, error } = useManuscriptList({
    useRealData: true,
    status: null,
    orderBy: "submission_date",
    orderDirection: { ascending: false }
  });

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Manuscript Debug Information</h1>
      
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-semibold">User Info:</h3>
        <pre className="text-sm mt-2">{JSON.stringify(user, null, 2)}</pre>
      </div>

      <div className="bg-yellow-50 p-4 rounded">
        <h3 className="font-semibold">Hook State:</h3>
        <p><strong>Loading:</strong> {isLoading ? 'YES' : 'NO'}</p>
        <p><strong>Error:</strong> {error || 'None'}</p>
        <p><strong>Manuscripts Count:</strong> {manuscripts?.length || 0}</p>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded">
          <h3 className="font-semibold text-red-800">Error Details:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {manuscripts && manuscripts.length > 0 && (
        <div className="bg-green-50 p-4 rounded">
          <h3 className="font-semibold">Sample Manuscript Data:</h3>
          <pre className="text-sm mt-2 overflow-auto max-h-96">
            {JSON.stringify(manuscripts[0], null, 2)}
          </pre>
        </div>
      )}

      {manuscripts && (
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-4">All Manuscripts ({manuscripts.length}):</h3>
          <div className="space-y-2">
            {manuscripts.map((manuscript, index) => (
              <div key={manuscript.id || index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="font-medium">{manuscript.title}</div>
                <div className="text-sm text-gray-600">
                  Author: {manuscript.author} | Status: {manuscript.status} | Genre: {manuscript.genre}
                </div>
                <div className="text-sm text-gray-500">
                  Editor: {manuscript.editor} | Words: {manuscript.word_count?.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManuscriptDebug; 