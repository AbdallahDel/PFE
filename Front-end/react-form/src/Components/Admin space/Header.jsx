import React from 'react'
import { Users, Settings, Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  const handleLoggedOut = async()=>{
    const confirmed = window.confirm("Are you sure you want to Logout");
    if (!confirmed) return;

    const response = await  fetch ('http://localhost/PFE/Back-end/logOut.php',{
      method: 'POST',
      credentials: 'include',
    });
  if (response.ok){
    const data = await response.json();
    if (data.status === 'success'){
      console.log('Logged out successfully');
      navigate('/');
    } else {
      console.log('Failed to log out');
    }
  } else {
    throw new Error(`HTTP error: ${response.status}`);  }
  }

  return (
    <div>

<div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
        <div className="text-lg text-white">ADMIN SPACE</div>
        <div className="flex items-center space-x-4">
          
          <button className="flex items-center gap-2 px-4 py-2 text-white bg-red-800 rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
 onClick={handleLoggedOut}>Logout</button>

        </div>
      </div>

    </div>
  )
}
