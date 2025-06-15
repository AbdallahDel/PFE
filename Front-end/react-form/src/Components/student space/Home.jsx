import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentHeader from './StudentHeader';
import StudentSidebar from './StudentSideBar';

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  
  // Fetch user info when component mounts
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const response = await fetch('http://localhost:8000/GetUserInfo.php', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success') {
            setUserName(data.username);
          } else {
            console.error('Error:', data.message);
          }
        } else {
          console.error(`HTTP error! Status: ${response.status}`);
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };
    
    getUserInfo();
  }, []);

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
    <div className="flex flex-col h-screen">
      <StudentHeader handleLoggedOut={handleLoggedOut} />
      
      <div className="flex flex-1 overflow-hidden">
        <StudentSidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Bienvenue Dans Votre Espace</h2>
            
            <div className="mb-6">
              
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}