import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function StudentHeader() {
    const navigate = useNavigate();
    const handleLoggedOut = async () => {
    const confirmed = window.confirm("Are you sure you want to logout this account?");
    if (!confirmed) return;
    
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
        navigate('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  return (
    <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">
        <Link to="/Home" className="text-xl font-bold hover:text-gray-200">
        ESPACE ETUDIANT
      </Link>
        </h1>
        
      <div className="flex items-center gap-4">
        <Link to="/Profile" className="hover:underline">Profile</Link>
        <button 
          onClick={handleLoggedOut}
          className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}