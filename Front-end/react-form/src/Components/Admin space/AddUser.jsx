import { useState } from 'react';
import { X } from 'lucide-react';

export default function AddUserPopup({onClose,onAddUser}) {


  const [userName,setUserName]= useState('');
  const [Password,setPassword]= useState('');
  const [Role,setRole]= useState('');

  
  const handleSubmit=async(e)=>{
    e.preventDefault();


    if (!userName || !Password) {
      alert("All fields are required!");
      return;
    }
     // Just send the data directly without converting to JSON
  const userData = {
  userName: userName,
  Password: Password,
  Role: Role || 'user'
};

onAddUser(userData);


  }
  
  
  
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg w-80">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">Add New User</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">user Name</label>
            <input
              type="text"
              name="userName"
              value={userName}
              onChange={(e)=>setUserName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>
          
          
          
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={Role}
              onChange={(e)=>setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="supervisor">supervisor</option>

            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="Password"
              name="Password"
              value={Password}
              onChange={(e)=>setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}