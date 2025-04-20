import React from 'react';
import Home from './Home';
import { useState, useEffect } from 'react';

export default function Profile() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const GetUserInfo = async () => {
      const response = await fetch('http://localhost/PFE/Back-end/GetUserInfo.php', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setUserName(data.username);
          setEmail(data.email);
        } else {
          console.error('Error:', data.message);
        }
      } else {
        console.error(`HTTP error! Status: ${response.status}`);
      }
    };
    GetUserInfo();
  }, []);

  return (
    <>
      <div>
        <Home />
      </div>
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Profile</h1>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
            <span className="font-medium">Username:</span>
            <span>{userName}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
            <span className="font-medium">Email:</span>
            <span>{email}</span>
          </div>
        </div>
      </div>
    </>
  );
}
