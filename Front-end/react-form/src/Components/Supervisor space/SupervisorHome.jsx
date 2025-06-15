import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import SupervisorHeader from './SupervisorHeader';
import SupervisorSideBar from './supervisorSideBar';

export default function SupervisorDashboard() {
  const [supervisorData, setSupervisorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSupervisorData();
  }, []);

  const fetchSupervisorData = async () => {
    try {
      const response = await fetch('http://localhost:8000/supervisorProfile.php', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setSupervisorData(data.supervisor);
      } else {
        throw new Error(data.message || 'Failed to load supervisor data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-16">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
        Error loading supervisor data
      </div>
    );
  }
  const navigateTo = (path) => {
    console.log('Navigating to:', path);
    // You can use react-router-dom's useNavigate if needed
  };
  


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <SupervisorHeader/>            
      <div className="flex flex-1">
        <SupervisorSideBar navigateTo={navigateTo}/>
        {/* Main content */}
        <main className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-700">
          {supervisorData?.prenom?.charAt(0)}{supervisorData?.nom?.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-medium">{supervisorData?.prenom} {supervisorData?.nom}</h2>
          <p className="text-gray-600 text-sm">{supervisorData?.grade}</p>
        </div>
      </div>
    </div>
       </main>
      </div>
    </div>
  );
}