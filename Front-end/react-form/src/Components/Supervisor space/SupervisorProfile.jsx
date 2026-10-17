import React, { useState, useEffect } from 'react';
import { User, Mail, Book, Briefcase, UserCheck, Clock } from 'lucide-react';
import SupervisorHeader from './SupervisorHeader';
import SupervisorSideBar from './SupervisorSideBar';

export default function SupervisorProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSupervisorProfile();
  }, []);

  const fetchSupervisorProfile = async () => {
    try {
      // Add a cache buster to prevent caching issues
      const cacheBuster = new Date().getTime();
      const response = await fetch(`http://localhost/PFE/Back-end/supervisorProfile.php?cb=${cacheBuster}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        console.log("Profile data received:", data.supervisor);
        setProfileData(data.supervisor);
      } else {
        throw new Error(data.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError(err.message || 'An error occurred while fetching profile data');
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path) => {
    // This would be replaced with proper navigation in your app
    console.log('Navigating to:', path);
    // If you're using react-router-dom, you would use navigate(path) here
  };

  // Safely render the user initials
  const getInitials = () => {
    const firstName = profileData?.prenom || '';
    const lastName = profileData?.nom || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <SupervisorHeader />
      <div className="flex flex-1">
        <SupervisorSideBar navigateTo={navigateTo} />
        
        {/* Main content */}
        <main className="flex-1 p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-3 text-blue-500">Loading profile data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Error!</strong>
              <p className="block mt-1">{error}</p>
              <p className="mt-2">Please check your connection and try again.</p>
              <button 
                onClick={fetchSupervisorProfile}
                className="mt-3 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-700">
                    {getInitials()}
                  </div>
                </div>
                
                <div className="flex-grow">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {profileData?.prenom} {profileData?.nom}
                  </h1>
                  <p className="text-gray-600 mb-4">{profileData?.grade || 'Supervisor'}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <UserCheck className="text-blue-500" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Supervisor ID</p>
                        <p className="font-medium">{profileData?.supervisor_id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Mail className="text-blue-500" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">User ID</p>
                        <p className="font-medium">{profileData?.userID}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Briefcase className="text-blue-500" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Grade</p>
                        <p className="font-medium">{profileData?.grade}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Book className="text-blue-500" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Projects</p>
                        <p className="font-medium">{profileData?.project_count || 0} active projects</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p className="bg-gray-50 p-3 rounded border border-gray-200">{profileData?.prenom} {profileData?.nom}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                    <p className="bg-gray-50 p-3 rounded border border-gray-200">{profileData?.userID}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                    <p className="bg-gray-50 p-3 rounded border border-gray-200">{profileData?.grade}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor ID</label>
                    <p className="bg-gray-50 p-3 rounded border border-gray-200">{profileData?.supervisor_id}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-blue-800">Active Projects</h3>
                      <Book className="text-blue-500" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{profileData?.project_count || 0}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-green-800">Experience</h3>
                      <Clock className="text-green-500" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-green-700">{profileData?.grade || "N/A"}</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-purple-800">Supervisor Role</h3>
                      <User className="text-purple-500" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-purple-700">Active</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}