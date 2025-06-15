import { useState } from 'react';
import SupervisorHeader from './SupervisorHeader';
import SupervisorSidebar from './SupervisorSidebar';

export default function SupervisorPasswordChange() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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
      
      const response = await fetch('http://localhost:8000/ChangePassword.php', {
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <SupervisorHeader />
      <div className="flex flex-1">
        <SupervisorSidebar className="h-[calc(100vh-64px)]" /> {/* Assuming header is 64px */}
        <main className="flex-1 p-8">
          <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Change Supervisor Password</h2>
            
            {passwordMessage && (
              <div className={`p-3 mb-4 rounded ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {passwordMessage}
              </div>
            )}
            
            <form onSubmit={handlePasswordChange}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="currentPassword">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Update Password
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}