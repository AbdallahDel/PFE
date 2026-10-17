import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import SideBar from './SideBar';

export default function AdminProfile() {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  
  useEffect(() => {
    const getAdminInfo = async () => {
      try {
        const response = await fetch('http://localhost/PFE/Back-end/GetAdminInfo.php', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success') {
            setAdminData(data.admin);
          } else {
            console.error('Error:', data.message);
          }
        } else {
          console.error(`HTTP error! Status: ${response.status}`);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch admin info:', error);
        setIsLoading(false);
      }
    };
    
    getAdminInfo();
  }, []);
  
  

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match');
      setMessageType('error');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters');
      setMessageType('error');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('oldPassword', oldPassword);
      formData.append('newPassword', newPassword);
      
      const response = await fetch('http://localhost/PFE/Back-end/ChangePassword.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setPasswordMessage('Password changed successfully');
        setMessageType('success');
        // Clear the form
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage(data.message || 'Failed to change password');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Password change failed:', error);
      setPasswordMessage('An error occurred while changing password');
      setMessageType('error');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header/>
      
      <div className="flex flex-1 overflow-hidden">
        <SideBar />
        
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Admin Profile</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-lg">Loading profile data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Admin Info Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Admin Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="font-medium">{adminData.userID}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-medium">{adminData.userName}</p>
                    </div>
                    
                    
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium">{adminData.Role}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium">{adminData.PhoneNumber || "Not set"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{adminData.Email || "Not set"}</p>
                    </div>
                  </div>
                </div>
                
                {/* Password Change Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Change Password</h3>
                  
                  {passwordMessage && (
                    <div className={`p-3 rounded mb-4 ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {passwordMessage}
                    </div>
                  )}
                  
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="oldPassword"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}