import React, { useState } from 'react'
import { Users, Settings, Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
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
        navigate('/');
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
    <div>
      <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
        <div className="text-lg text-white">ADMIN SPACE</div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-white bg-red-800 rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
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
    </div>
  )
}
