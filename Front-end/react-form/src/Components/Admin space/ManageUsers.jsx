import React, { useState, useEffect } from 'react';
import { Users, Search, Edit, Trash2, UserPlus, Save, X, Upload } from 'lucide-react';
import SideBar from './SideBar';
import Header from './Header';
import AddStudent from './AddStudent';
import AddSupervisor from './AddSupervisor';
import AddAdmin from './AddAdmin';
import * as XLSX from 'xlsx';

const ManageUsers = () => {
  const API_BASE_URL = 'http://localhost/PFE/Back-end';
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editingData, setEditingData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsResponse, supervisorsResponse, adminsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/getStudents.php`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/getSupervisors.php`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/getAdmins.php`, { credentials: 'include' })
      ]);

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      }

      if (supervisorsResponse.ok) {
        const supervisorsData = await supervisorsResponse.json();
        setSupervisors(Array.isArray(supervisorsData) ? supervisorsData : []);
      }

      if (adminsResponse.ok) {
        const adminsData = await adminsResponse.json();
        setAdmins(Array.isArray(adminsData) ? adminsData : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDelete = async(id) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;
    
    const endpoint = activeTab === 'students' 
      ? 'deleteStudent.php' 
      : activeTab === 'supervisors'
      ? 'deleteSupervisor.php'
      : 'deleteUser.php';
    
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        if (activeTab === 'students') {
          setStudents(prev => prev.filter(student => student.studentID !== id));
        } else if (activeTab === 'supervisors') {
          setSupervisors(prev => prev.filter(supervisor => supervisor.supervisorID !== id));
        } else {
          setAdmins(prev => prev.filter(admin => admin.userID !== id));
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleAddUser = async (userData, type) => {
    try {
      const endpoint = type === 'student' 
        ? 'addStudent.php' 
        : type === 'supervisor'
        ? 'addSupervisor.php'
        : 'addAdmin.php';

      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          fetchData();
          setShowAddForm(false);
        } else {
          alert(result.message);
        }
      }
    } catch (error) {
      console.error(`Error adding ${type}:`, error);
      alert(`Failed to add ${type}`);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditingData({...item});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const endpoint = activeTab === 'students' 
        ? 'updateStudent.php' 
        : activeTab === 'supervisors'
        ? 'updateSupervisor.php'
        : 'updateUser.php';

      // Include the item ID based on the active tab
      const itemId = activeTab === 'students' 
        ? editingData.studentID 
        : activeTab === 'supervisors'
        ? editingData.supervisorID
        : editingData.userID;

      const dataToSend = {
        ...editingData,
        [`${activeTab.slice(0, -1)}ID`]: itemId
      };

      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          // Update local state
          if (activeTab === 'students') {
            setStudents(prev => prev.map(item => 
              item.studentID === itemId ? { ...item, ...editingData } : item
            ));
          } else if (activeTab === 'supervisors') {
            setSupervisors(prev => prev.map(item => 
              item.supervisorID === itemId ? { ...item, ...editingData } : item
            ));
          } else {
            setAdmins(prev => prev.map(item => 
              item.userID === itemId ? { ...item, ...editingData } : item
            ));
          }
          setEditingItem(null);
          setEditingData({});
          alert('Changes saved successfully');
        } else {
          alert(result.message);
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving changes');
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
  };

  const getFilteredData = () => {
    const searchLower = searchTerm.toLowerCase();
    
    switch (activeTab) {
      case 'students':
        return students.filter(student => 
          student.first_name?.toLowerCase().includes(searchLower) ||
          student.last_name?.toLowerCase().includes(searchLower) ||
          student.matricule?.toLowerCase().includes(searchLower) ||
          student.email?.toLowerCase().includes(searchLower)
        );
      case 'supervisors':
        return supervisors.filter(supervisor =>
          supervisor.first_name?.toLowerCase().includes(searchLower) ||
          supervisor.last_name?.toLowerCase().includes(searchLower) ||
          supervisor.email?.toLowerCase().includes(searchLower)
        );
      case 'admins':
        return admins.filter(admin =>
          admin.userName?.toLowerCase().includes(searchLower)
        );
      default:
        return [];
    }
  };

  const renderEditableCell = (field, value) => {
    if (field === 'education_level') {
      return (
        <select
          name={field}
          value={value}
          onChange={handleEditChange}
          className="w-full px-2 py-1 border border-gray-300 rounded-md"
        >
          <option value="licence">Licence</option>
          <option value="master">Master</option>
        </select>
      );
    }
    return (
      <input
        type="text"
        name={field}
        value={value || ''}
        onChange={handleEditChange}
        className="w-full px-2 py-1 border border-gray-300 rounded-md"
      />
    );
  };

  const renderTable = () => {
    const data = getFilteredData();

    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {activeTab === 'students' ? (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matricule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Speciality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
              </>
            ) : activeTab === 'supervisors' ? (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              </>
            ) : (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              </>
            )}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.studentID || item.supervisorID || item.userID}>
              {activeTab === 'students' ? (
                <>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingItem === item ? 
                      renderEditableCell('matricule', editingData.matricule) : 
                      item.matricule}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingItem === item ? (
                      <div className="flex space-x-2">
                        {renderEditableCell('first_name', editingData.first_name)}
                        {renderEditableCell('last_name', editingData.last_name)}
                      </div>
                    ) : (
                      `${item.first_name} ${item.last_name}`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingItem === item ? 
                      renderEditableCell('email', editingData.email) : 
                      item.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingItem === item ? 
                      renderEditableCell('speciality', editingData.speciality) : 
                      item.speciality}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingItem === item ? 
                      renderEditableCell('education_level', editingData.education_level) : 
                      item.education_level}
                  </td>
                </>
              ) : activeTab === 'supervisors' ? (
                <>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingItem === item ? 
                      renderEditableCell('userName', editingData.userName) : 
                      item.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingItem === item ? (
                      <div className="flex space-x-2">
                        {renderEditableCell('first_name', editingData.first_name)}
                        {renderEditableCell('last_name', editingData.last_name)}
                      </div>
                    ) : (
                      `${item.first_name} ${item.last_name}`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingItem === item ? 
                      renderEditableCell('email', editingData.email) : 
                      item.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingItem === item ? 
                      renderEditableCell('phone_number', editingData.phone_number) : 
                      item.phone_number}
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingItem === item ? 
                      renderEditableCell('userName', editingData.userName) : 
                      item.userName}
                  </td>
                </>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end space-x-2">
                  {editingItem === item ? (
                    <>
                      <button 
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Save size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingItem(null);
                          setEditingData({});
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.studentID || item.supervisorID || item.userID)} 
                        className="text-red-600 hover:text-red-900"
                      >
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
    );
  };

  const handleImportFile = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Format data based on type
        const formattedData = data.map(row => {
          if (type === 'student') {
            return {
              first_name: row.first_name || '',
              last_name: row.last_name || '',
              email: row.email || '',
              speciality: row.speciality || '',
              education_level: row.education_level || 'licence',
              matricule: row.matricule || '',
              phone_number: row.phone_number || '',
              password: row.password || row.matricule
            };
          } else if (type === 'supervisor') {
            return {
              userName: row.userName || '',
              first_name: row.first_name || '',
              last_name: row.last_name || '',
              email: row.email || '',
              phone_number: row.phone_number || '',
              password: row.password || row.userName
            };
          }
        });

        try {
          const response = await fetch(`${API_BASE_URL}/ImportedData.php`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              type: type,
              users: formattedData
            })
          });

          if (response.ok) {
            const result = await response.json();
            if (result.status === 'success') {
              alert(`Successfully imported ${result.success_count} ${type}s. ${result.error_count} errors.`);
              fetchData(); // Refresh the data
            } else {
              alert('Error during import: ' + result.message);
            }
          }
        } catch (error) {
          console.error(`Error importing ${type}s:`, error);
          alert(`Error importing ${type}s`);
        }
      } catch (error) {
        console.error('Error reading Excel file:', error);
        alert('Error reading Excel file');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <SideBar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
              <Users className="mr-2" size={24} />
              Manage Users
            </h1>
            
            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-6">
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'students'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setActiveTab('students')}
              >
                Students
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'supervisors'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setActiveTab('supervisors')}
              >
                Supervisors
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'admins'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setActiveTab('admins')}
              >
                Admins
              </button>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {(activeTab === 'students' || activeTab === 'supervisors') && (
                <div className="ml-4">
                  <input
                    type="file"
                    id={`import${activeTab}`}
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => handleImportFile(e, activeTab.slice(0, -1))}
                    className="hidden"
                  />
                  <label
                    htmlFor={`import${activeTab}`}
                    className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Upload size={20} className="mr-2" />
                    Import {activeTab}
                  </label>
                </div>
              )}
              <button
                onClick={() => setShowAddForm(true)}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <UserPlus size={20} className="mr-2" />
                Add New {activeTab.slice(0, -1)}
              </button>
            </div>

            {/* Add Form Modal */}
            {showAddForm && (
              activeTab === 'students' 
                ? <AddStudent 
                    onClose={() => setShowAddForm(false)}
                    onAddStudent={(data) => handleAddUser(data, 'student')}
                  />
                : activeTab === 'supervisors'
                ? <AddSupervisor
                    onClose={() => setShowAddForm(false)}
                    onAddSupervisor={(data) => handleAddUser(data, 'supervisor')}
                  />
                : <AddAdmin
                    onClose={() => setShowAddForm(false)}
                    onAddAdmin={(data) => handleAddUser(data, 'admin')}
                  />
            )}

            {/* Content Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                {renderTable()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageUsers;