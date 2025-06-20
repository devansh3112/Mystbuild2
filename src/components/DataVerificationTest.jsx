import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const DataVerificationTest = () => {
  const [data, setData] = useState({
    manuscripts: [],
    profiles: [],
    assignments: [],
    notifications: [],
    reviews: [],
    analytics: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        // Fetch manuscripts with author info
        const { data: manuscripts, error: manuscriptsError } = await supabase
          .from('manuscripts')
          .select(`
            id,
            title,
            genre,
            status,
            word_count,
            submission_date,
            profiles:author_id (id, name, role)
          `)
          .limit(10);

        if (manuscriptsError) throw manuscriptsError;

        // Fetch profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, role, bio, specialties, hourly_rate, availability_status')
          .limit(10);

        if (profilesError) throw profilesError;

        // Fetch assignments with relationships
        const { data: assignments, error: assignmentsError } = await supabase
          .from('assignments')
          .select(`
            id,
            status,
            priority,
            assignment_type,
            estimated_hours,
            hourly_rate,
            total_cost,
            progress_percentage,
            manuscripts:manuscript_id (title),
            profiles:editor_id (name)
          `)
          .limit(10);

        if (assignmentsError) throw assignmentsError;

        // Fetch notifications
        const { data: notifications, error: notificationsError } = await supabase
          .from('notifications')
          .select(`
            id,
            title,
            message,
            type,
            category,
            is_read,
            created_at,
            profiles:user_id (name, role)
          `)
          .limit(10);

        if (notificationsError) throw notificationsError;

        // Fetch reviews
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            id,
            review_type,
            content,
            rating,
            status,
            created_at,
            manuscripts:manuscript_id (title),
            profiles:reviewer_id (name)
          `)
          .limit(10);

        if (reviewsError) throw reviewsError;

        // Fetch analytics summary
        const { data: userActivity, error: activityError } = await supabase
          .from('user_activity')
          .select('action, resource_type, created_at')
          .limit(20);

        if (activityError) throw activityError;

        const { data: manuscriptAnalytics, error: analyticsError } = await supabase
          .from('manuscript_analytics')
          .select('views, downloads, time_spent_seconds')
          .limit(10);

        if (analyticsError) throw analyticsError;

        const analytics = {
          totalActivity: userActivity.length,
          recentActions: userActivity.slice(0, 5),
          totalViews: manuscriptAnalytics.reduce((sum, item) => sum + item.views, 0),
          totalDownloads: manuscriptAnalytics.reduce((sum, item) => sum + item.downloads, 0)
        };

        setData({
          manuscripts,
          profiles,
          assignments,
          notifications,
          reviews,
          analytics,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching test data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchTestData();
  }, []);

  if (data.loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test data...</p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
          <p className="text-red-700 mt-2">{data.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎉 Database Test Data Verification
        </h1>
        <p className="text-gray-600">
          Comprehensive test showing live data from all backend tables
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{data.manuscripts.length}</div>
          <div className="text-sm text-blue-700">Manuscripts</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{data.profiles.length}</div>
          <div className="text-sm text-green-700">Users</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{data.assignments.length}</div>
          <div className="text-sm text-purple-700">Assignments</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{data.reviews.length}</div>
          <div className="text-sm text-orange-700">Reviews</div>
        </div>
      </div>

      {/* Manuscripts Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">📚 Manuscripts</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Title</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Author</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Genre</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Words</th>
              </tr>
            </thead>
            <tbody>
              {data.manuscripts.map((manuscript) => (
                <tr key={manuscript.id} className="border-b">
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{manuscript.title}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{manuscript.profiles?.name || 'Unknown'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{manuscript.genre}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      manuscript.status === 'published' ? 'bg-green-100 text-green-800' :
                      manuscript.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      manuscript.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {manuscript.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">{manuscript.word_count?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">👥 Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.profiles.map((profile) => (
            <div key={profile.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{profile.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  profile.role === 'writer' ? 'bg-blue-100 text-blue-800' :
                  profile.role === 'editor' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {profile.role}
                </span>
              </div>
              {profile.bio && (
                <p className="text-sm text-gray-600 mb-2">{profile.bio.substring(0, 100)}...</p>
              )}
              {profile.specialties && (
                <div className="flex flex-wrap gap-1">
                  {profile.specialties.slice(0, 3).map((specialty, idx) => (
                    <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {specialty}
                    </span>
                  ))}
                </div>
              )}
              {profile.hourly_rate && (
                <p className="text-sm font-medium text-green-600 mt-2">${profile.hourly_rate}/hr</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Assignments Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">📋 Assignments</h2>
        <div className="space-y-3">
          {data.assignments.map((assignment) => (
            <div key={assignment.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">
                  {assignment.manuscripts?.title || 'Unknown Manuscript'}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                  assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {assignment.status}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Editor:</span>
                  <p className="font-medium">{assignment.profiles?.name || 'Unassigned'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="font-medium">{assignment.assignment_type}</p>
                </div>
                <div>
                  <span className="text-gray-500">Rate:</span>
                  <p className="font-medium">${assignment.hourly_rate}/hr</p>
                </div>
                <div>
                  <span className="text-gray-500">Progress:</span>
                  <p className="font-medium">{assignment.progress_percentage}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">🔔 Notifications</h2>
        <div className="space-y-3">
          {data.notifications.map((notification) => (
            <div key={notification.id} className={`border rounded-lg p-4 ${
              notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{notification.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    notification.type === 'success' ? 'bg-green-100 text-green-800' :
                    notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    notification.type === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {notification.type}
                  </span>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
              <div className="text-xs text-gray-500">
                {notification.profiles?.name} • {new Date(notification.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Summary */}
      {data.analytics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">📊 Analytics Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{data.analytics.totalActivity}</div>
              <div className="text-sm text-gray-600">User Activities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{data.analytics.totalViews}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{data.analytics.totalDownloads}</div>
              <div className="text-sm text-gray-600">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{data.reviews.length}</div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center pt-8 border-t">
        <p className="text-green-600 font-semibold text-lg">
          ✅ All backend systems are operational with comprehensive test data!
        </p>
        <p className="text-gray-600 mt-2">
          Frontend successfully connected to database with {data.manuscripts.length} manuscripts, 
          {data.profiles.length} users, {data.assignments.length} assignments, and more.
        </p>
      </div>
    </div>
  );
};

export default DataVerificationTest;