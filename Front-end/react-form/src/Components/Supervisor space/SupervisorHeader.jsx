import React, { useState } from 'react';
import { 
  User, 
  Home, 
  FileText, 
  Users, 
  Calendar, 
  Settings, 
  LogOut
} from 'lucide-react';
function SupervisorHeader() {
    const [showConfirm, setShowConfirm] = useState(false);
  
  // Simple navigation function
  const navigateTo = (path) => {
    window.location.href = path;
  };
  
  // Logout functionality
  const handleLogout = () => {
    setShowConfirm(true);
  };
  
  const confirmLogout = async () => {
    try {
      const response = await fetch('http://localhost:8000/logOut.php', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'success') {
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

  return (
    <>
<header className="bg-gray-800 text-white p-3 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Supervisor System</h1>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

        {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded shadow-lg">
                <h3 className="font-medium mb-3">Confirm Logout</h3>
                <div className="flex justify-end gap-2">
                <button
                    onClick={cancelLogout}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm"
                >
                    Cancel
                </button>
                <button
                    onClick={confirmLogout}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                    Logout
                </button>
                </div>
            </div>
            </div>
        )}
        </>
  );
}

export default SupervisorHeader