import React, { useState } from 'react';
import { LogOut, User, Home } from 'lucide-react';

export default function SupervisorHeader() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      const response = await fetch('http://localhost/PFE/Back-end/logOut.php', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        // Instead of navigate, use window.location
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setShowConfirm(false);
    }
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  // Mock navigation function without react-router
  const navigateTo = (path) => {
    window.location.href = path;
  };

  return (
    <header className="bg-blue-950 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Supervisor Space</h1>
        
        <nav className="flex items-center gap-6">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigateTo('/supervisor-dashboard'); }}
            className="flex items-center gap-1 hover:text-blue-200 transition-colors cursor-pointer"
          >
            <Home size={18} />
            <span>Dashboard</span>
          </a>
          
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigateTo('/supervisor-profile'); }}
            className="flex items-center gap-1 hover:text-blue-200 transition-colors cursor-pointer"
          >
            <User size={18} />
            <span>Profile</span>
          </a>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-black">
            <h3 className="text-lg font-medium mb-4">Are you sure you want to logout?</h3>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelLogout}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}