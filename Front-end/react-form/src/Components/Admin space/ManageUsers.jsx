import React, { useState, useEffect } from 'react';
import { Users, Search, MoreVertical, Edit, Trash2, UserPlus, Filter, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import SideBar from './SideBar';
import Header from './Header';
import AddUser from './AddUser';
import ImportButton from './ImportButton';



const ManageUsers = (formData) => {
  // Sample user data - replace with your actual data source
  const API_BASE_URL = 'http://localhost/PFE/Back-end';

  const [users, setUsers] = useState([]); 
  const [Editing, setEditing] = useState(false);
  const [EditedData, setEditedData] = useState({});
  const [EditingID, setEditingID] = useState(null);
  const [ShowAddUser,SetShowAddUser]= useState(false);
  const [importedUser,setImportedUser]=useState([]);


  
  useEffect(() => {
    const getUsers = async () => {
      const response = await fetch(`${API_BASE_URL}/manageUsers.php`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data); // Log the entire response
        setUsers(Array.isArray(data) ? data : []);
      }
      else {
        console.error(`HTTP error! Status: ${response.status}`);
      }
    }
    getUsers();

    
  }, []);

  // Search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // Add role filter state

  const filteredUsers = users.filter(user => {
    const matchesSearch = (
      (user.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.Email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.Role?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.PhoneNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    
    return matchesSearch && (roleFilter === 'all' || user.Role === roleFilter);
  });

  const handleDelete = async(userID) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;
    try {
      const response = await fetch(`${API_BASE_URL}/deleteUser.php`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: userID })
      });
      
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      try {
        const data = JSON.parse(responseText);
        console.log('Parsed data:', data);
        
        if (data.status === 'success') {
          setUsers(prevUsers => prevUsers.filter(user => user.userID !== userID));
        }
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  // Start editing a user
  const startEditing = (user) => {
    setEditingID(user.userID);
    setEditing(true);
    setEditedData({...user});
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingID(null);
    setEditing(false);
    setEditedData({});
  };

  // Handle input change
  const handleInputChange = (e, field) => {
    setEditedData({
      ...EditedData,
      [field]: e.target.value
    });
  };

  // Save edited user
  const saveUser = async() => {
    try {
      const response = await fetch(`${API_BASE_URL}/updateUser.php`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(EditedData)
        
      });

      if (response.ok){
        const data = await response.json();
        console.log(data);
      }else {
        console.error(`HTTP error! Status: ${response.status}`);
      }
      


      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.userID === EditingID ? EditedData : user
        )
      );
      
      // Reset editing state
      setEditing(false);
      setEditingID(null);
      setEditedData({});
      
    } catch (error) {
      console.error('Save error:', error);
    }
  };


  //adding new user 
  //////
  ////
  ///
  //
  const handleAdding = async (userData) => {
    
    try {
    // Add further logic for form submission, e.g., API call
    const response = await  fetch (`${API_BASE_URL}/addUser.php`,{
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded' // Change this from 'application/json'
      },
      body: new URLSearchParams(userData).toString() // Convert to form URL encoded format
    });
    if (!response.ok){
        throw new Error(`HTTP error: ${response.status}`);
    
    }
    const data = await  response.json();
    console.log(data);
    if (data.message ==='user added with success'){
      setUsers(prevUsers => [...prevUsers, {
        userID: data.userID,
        userName: userData.userName,
        Email: '', // Default value
        PhoneNumber: '', // Default value
        Role: userData.Role
    }]);        SetShowAddUser(false);
        

    }
    else {
        console.log('Error: ' + data.message);
    }
}catch (error){
    console.log('request error :'+ error.message);
}
//emplty the iputs



};
////////////////////
const handleImportedUsers = async (importedData) => {
  console.log("Data received in parent:", importedData);
  
  // Add default role to imported users if needed
  const importedWithRole = importedData.map(user => ({
    ...user,
    Role: 'user' // or 'supervisor' or any default value
  }));
  
  try {
    // API call to save the imported users
    const response = await fetch(`${API_BASE_URL}/ImportedData.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(importedWithRole)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(result);
    
    if (result.message === 'imported user/s saved with success') {
      // Update the local state with the new users
      setUsers(prevUsers => [...prevUsers, ...importedWithRole]);
      //console.log('the new table:',[...users, ...importedWithRole].map(user=>user.userName));
      alert("Import successful!");
    } else {
      console.log('Error: ' + result.message);
      alert("Impor failed");

    }
  } catch (error) {
    console.log('Request error: ' + error.message);
  }
};

  return (
    
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <SideBar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Users className="mr-2" size={24} />
              Manage Users
            </h1>
            
            <div className="flex items-center space-x-4">
              <ImportButton onImport={handleImportedUsers} />
              <button onClick={() => SetShowAddUser(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
                <UserPlus size={16} className="mr-2" />
                Add New User
              </button>
            </div>
            {ShowAddUser && <AddUser onAddUser={handleAdding} onClose={() => SetShowAddUser(false)} />}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            {/* Search and Filter Bar */}
            <div className="mb-6 flex items-center gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users by name, email or role..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.userID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {EditingID === user.userID ? (
                          <input 
                            className="w-full px-2 py-1 border border-gray-300 rounded-md" 
                            value={EditedData.userName || ''} 
                            onChange={(e) => handleInputChange(e, 'userName')} 
                          />
                        ) : (
                          <span className="font-medium text-gray-900">{user.userName}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {EditingID === user.userID ? (
                          <input 
                            className="w-full px-2 py-1 border border-gray-300 rounded-md" 
                            value={EditedData.Email || ''} 
                            onChange={(e) => handleInputChange(e, 'Email')} 
                          />
                        ) : (
                          <span className="text-gray-500">{user.Email}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {EditingID === user.userID ? (
                          <input 
                            className="w-full px-2 py-1 border border-gray-300 rounded-md" 
                            value={EditedData.PhoneNumber || ''} 
                            onChange={(e) => handleInputChange(e, 'PhoneNumber')} 
                          />
                        ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.PhoneNumber === 'Active' ? 'bg-green-100 text-green-800' : 'text-gray-500'
                          }`}>
                            {user.PhoneNumber}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {EditingID === user.userID ? (
                          <select 
                            className="w-full px-2 py-1 border border-gray-300 rounded-md"
                            value={EditedData.Role || ''}
                            onChange={(e) => handleInputChange(e, 'Role')}
                          >
                            <option value="admin">admin</option>
                            <option value="user">User</option>
                            <option value="supervisor">supervisor</option>

                          </select>
                        ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.Role === 'admin' ? 'bg-purple-100 text-green-800' : 
                            user.Role === 'user' ? 'bg-blue-100 text-blue-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.Role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {EditingID === user.userID ? (
                            <>
                              <button onClick={saveUser} className="text-green-600 hover:text-green-900">
                                <Save size={16} />
                              </button>
                              <button onClick={cancelEditing} className="text-red-600 hover:text-red-900">
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEditing(user)} className="text-blue-600 hover:text-blue-900">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => handleDelete(user.userID)} className="text-red-600 hover:text-red-900">
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination - Simple Version */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Previous
                </button>
                <button className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of{" "}
                    <span className="font-medium">{filteredUsers.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button aria-current="page" className="relative z-10 inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                      1
                    </button>
                    <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageUsers;