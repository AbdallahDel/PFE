import React, { useState, useEffect } from 'react';
import { FileText, Search, Edit, Trash2, FilePlus, Save, X, Check, XCircle, Eye, Award, AlertCircle, Filter } from 'lucide-react';
import SideBar from './SideBar';
import Header from './Header';
import AddSujet from './AddSujet';

const ManageSujets = () => {
  // API base URL
  const API_BASE_URL = 'http://localhost/PFE/Back-end';

  // State management
  const [sujets, setSujets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [editingID, setEditingID] = useState(null);
  const [showAddSujet, setShowAddSujet] = useState(false);
  const [supervisors, setSupervisors] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'intern', 'extern'

  // Fetch subjects on component mount
  useEffect(() => {
    const getSujets = async () => {
      setLoading(true);
      let url = `${API_BASE_URL}/getSujetsInfo.php`;
  
      try {
        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('Response data:', data);
          setSujets(Array.isArray(data) ? data : []);
          setError(null);
        } else {
          console.error(`HTTP error! Status: ${response.status}`);
          setError(`Failed to load data: ${response.status}`);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError(`Error fetching data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
  
    getSujets();
  }, []);
  
  // Enhanced search and filter functionality
  const filteredSujets = sujets.filter(sujet => {
    // Search term filter
    const matchesSearch = (sujet.titre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (sujet.niveau?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (sujet.equipe?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (sujet.encadrant?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (sujet.etat?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = typeFilter === 'all' || 
      (sujet.type?.toLowerCase() || '') === typeFilter.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  // Delete subject function
  const handleDelete = async(sujetID) => {
    const confirmed = window.confirm("Are you sure you want to delete this subject?");
    if (!confirmed) return;
    try {
      const response = await fetch(`${API_BASE_URL}/deleteSujet.php`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: sujetID })
      });
      
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      try {
        const data = JSON.parse(responseText);
        console.log('Parsed data:', data);
        
        if (data.status === 'success') {
          setSujets(prevSujets => prevSujets.filter(sujet => sujet.sujetID !== sujetID));
        }
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  // Add this useEffect to fetch supervisors when editing mode is activated
  useEffect(() => {
    if (editing) {
      const fetchSupervisors = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/getAvailableSupervisors.php`, {
            credentials: 'include',
            headers: {
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
              setSupervisors(data.supervisors);
            }
          }
        } catch (error) {
          console.error('Error fetching supervisors:', error);
        }
      };

      fetchSupervisors();
    }
  }, [editing, API_BASE_URL]);

  // Update the startEditing function to allow encadrant editing
  const startEditing = (sujet) => {
    setEditingID(sujet.sujetID);
    setEditing(true);
    setEditedData({
      sujetID: sujet.sujetID,
      titre: sujet.titre,
      description: sujet.description || '',
      etat: sujet.etat,
      encadrant: sujet.encadrant, // Now include encadrant in editable fields
      // Include these for reference but don't let the user edit them
      niveau: sujet.niveau,
      equipe: sujet.equipe,
    });
  };

  // Update the handleInputChange function to allow encadrant changes
  const handleInputChange = (e, field) => {
    // Now include encadrant in the permitted fields
    if (['titre', 'etat', 'description', 'encadrant'].includes(field)) {
      setEditedData({
        ...editedData,
        [field]: e.target.value
      });
    }
  };

  // Update the saveSujet function to include encadrant
  const saveSujet = async() => {
    try {
      const dataToUpdate = {
        sujetID: editedData.sujetID,
        titre: editedData.titre,
        etat: editedData.etat,
        description: editedData.description,
        encadrant: editedData.encadrant // Add encadrant to the update data
      };
      
      const response = await fetch(`${API_BASE_URL}/updateSujet.php`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToUpdate)
      });
      
      if (response.ok){
        const data = await response.json();
        console.log(data);
        
        // Update the local state with the encadrant change
        setSujets(prevSujets => 
          prevSujets.map(sujet => 
            sujet.sujetID === editingID ? {
              ...sujet,
              titre: editedData.titre,
              etat: editedData.etat,
              description: editedData.description,
              encadrant: editedData.encadrant // Include encadrant in the state update
            } : sujet
          )
        );
        
        // Reset editing state
        setEditing(false);
        setEditingID(null);
        setEditedData({});
      } else {
        console.error(`HTTP error! Status: ${response.status}`);
        alert('Failed to update subject. Please try again.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('An error occurred while saving. Please try again.');
    }
  };

  // Add the cancelEditing function that was missing
  const cancelEditing = () => {
    setEditing(false);
    setEditingID(null);
    setEditedData({});
  };

  // Approve a subject
  const handleApprove = async(sujetID) => {
    const confirmed = window.confirm("Are you sure you want to approve this subject?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/updateSujetEtat.php`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: sujetID,
          status: 'approved' 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          // Update local state to reflect the change
          setSujets(prevSujets => 
            prevSujets.map(sujet => 
              sujet.sujetID === sujetID ? {...sujet, etat: 'approved'} : sujet
            )
          );
        } else {
          console.error('Error:', data.message);
          alert('Failed to approve subject: ' + data.message);
        }
      } else {
        console.error(`HTTP error! Status: ${response.status}`);
        alert('Failed to approve subject. Please try again.');
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert('An error occurred while approving. Please try again.');
    }
  }

  // Reject a subject
  const handleReject = async(sujetID) => {
    const confirmed = window.confirm("Are you sure you want to reject this subject?");
    if (!confirmed) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/updateSujetEtat.php`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: sujetID,
          status: 'rejected' 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setSujets(prevSujets => 
            prevSujets.map(sujet => 
              sujet.sujetID === sujetID ? {...sujet, etat: 'rejected'} : sujet
            )
          );
        }
      }
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  // View PDF
  const handleViewPDF = (filePath) => {
    if (!filePath) {
      alert("No file has been uploaded for this project yet.");
      return;
    }
    
    // Open the PDF in a new tab
    window.open(`${API_BASE_URL}/${filePath}`, '_blank');
  };

  const handleAdding = async (newSubject) => {
    try {
      // No need to make the fetch call here anymore since it's done in AddSujet component
      // Just update the UI with the new subject data
      
      // Add the new subject to the state
      setSujets(prevSujets => [...prevSujets, {
        sujetID: newSubject.sujetID,
        titre: newSubject.titre,
        niveau: newSubject.niveau,
        encadrant: newSubject.encadrant,
        etat: newSubject.etat || 'disponible',
        description: newSubject.description,
        file_path: newSubject.file_path,
        type: newSubject.type,
        date_soumission: new Date().toISOString().split('T')[0],
        has_file: !!newSubject.file_path,
        actions: {
          can_view: !!newSubject.file_path,
          can_approve: true,
          can_reject: true,
          can_edit: true,
          can_delete: true
        }
      }]);
      
      // Close the modal
      setShowAddSujet(false);
      
      return { status: 'success' };
    } catch (error) {
      console.error('Error updating subjects state:', error);
      return { status: 'error', message: error.message };
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
              <FileText className="mr-2" size={24} />
              Manage Subjects
            </h1>
            
            <button onClick={() => setShowAddSujet(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
              <FilePlus size={16} className="mr-2" />
              Add New Subject
            </button>
           {showAddSujet && (
              <AddSujet
                onAddSujet={handleAdding}
                onClose={() => setShowAddSujet(false)}
              />
            )}

          </div>

          <div className="bg-white rounded-lg shadow p-6">
            {/* Search Bar and Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search subjects by title, level, team or supervisor..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-500" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="intern">Intern</option>
                  <option value="extern">Extern</option>
                </select>
              </div>
            </div>

            {/* Results Counter */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredSujets.length} of {sujets.length} subjects
                {typeFilter !== 'all' && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)} Projects
                  </span>
                )}
              </p>
            </div>

            {/* Loading and Error States */}
            {loading && (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
                {error}
              </div>
            )}

            {/* Subjects Table */}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Titre
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Niveau
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Equipe
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Encadrant
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Etat
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de soumission
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">

                  {filteredSujets.map((sujet) => (
                    <tr key={sujet.sujetID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingID === sujet.sujetID ? (
                          <input 
                            className="w-full px-2 py-1 border border-gray-300 rounded-md" 
                            value={editedData.titre || ''} 
                            onChange={(e) => handleInputChange(e, 'titre')} 
                          />
                        ) : (
                          <span className="font-medium text-gray-900">{sujet.titre}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sujet.type?.toLowerCase() === 'intern' ? 'bg-green-100 text-green-800' :
                          sujet.type?.toLowerCase() === 'extern' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sujet.type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* Level is not editable */}
                        <span className="text-gray-500">{sujet.niveau}</span>
                      </td>
                      <td className="px-6 py-4">
                        {/* Team is not editable */}
                        <div className="team-name text-gray-500">{sujet.equipe}</div>
                      </td>
                      {/* Replace the existing encadrant cell with this */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingID === sujet.sujetID ? (
                          <select 
                            className="w-full px-2 py-1 border border-gray-300 rounded-md"
                            value={editedData.encadrant || ''}
                            onChange={(e) => handleInputChange(e, 'encadrant')}
                          >
                            <option value={editedData.encadrant}>{editedData.encadrant}</option>
                            {supervisors.map((supervisor) => (
                              supervisor.name !== editedData.encadrant && (
                                <option key={supervisor.id} value={supervisor.name}>
                                  {supervisor.name} ({5 - supervisor.project_count} slots available)
                                </option>
                              )
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-500">{sujet.encadrant}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingID === sujet.sujetID ? (
                          <select 
                            className="w-full px-2 py-1 border border-gray-300 rounded-md"
                            value={editedData.etat || ''}
                            onChange={(e) => handleInputChange(e, 'etat')}
                          >
                            <option value="proposed">Proposed</option>
                            <option value="approved">approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            sujet.etat === 'Proposed' ? 'bg-blue-100 text-blue-800' : 
                            sujet.etat === 'approved' ? 'bg-green-100 text-green-800' :
                            sujet.etat === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sujet.etat}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-500">{sujet.date_soumission}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          {editingID === sujet.sujetID ? (
                            <>
                              <button onClick={saveSujet} className="text-green-600 hover:text-green-900 p-1" title="Save">
                                <Save size={16} />
                              </button>
                              <button onClick={cancelEditing} className="text-red-600 hover:text-red-900 p-1" title="Cancel">
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* View PDF */}
                              <button 
                                onClick={() => handleViewPDF(sujet.file_path)} 
                                className={`text-blue-600 hover:text-blue-900 p-1 ${!sujet.has_file ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={sujet.has_file ? "View PDF" : "No PDF available"}
                              >
                                <Eye size={16} />
                              </button>
                              
                              {/* Approve */}
                              {sujet.actions?.can_approve && (
                                <button 
                                  onClick={() => handleApprove(sujet.sujetID)} 
                                  className="text-green-600 hover:text-green-900 p-1"
                                  title="Approve"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              
                              {/* Reject */}
                              {sujet.actions?.can_reject && (
                                <button 
                                  onClick={() => handleReject(sujet.sujetID)} 
                                  className="text-orange-600 hover:text-orange-900 p-1"
                                  title="Reject"
                                >
                                  <XCircle size={16} />
                                </button>
                              )}
                              
                              {/* Edit */}
                              {sujet.actions?.can_edit && (
                                <button 
                                  onClick={() => startEditing(sujet)} 
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                              )}
                              
                              {/* Delete */}
                              {sujet.actions?.can_delete && (
                                <button 
                                  onClick={() => handleDelete(sujet.sujetID)} 
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {!loading && !error && filteredSujets.length > 0 && (
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
                      Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredSujets.length}</span> of{" "}
                      <span className="font-medium">{filteredSujets.length}</span> results
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
            )}
            
            {/* No results message */}
            {!loading && !error && filteredSujets.length === 0 && (
              <div className="text-center py-10">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || typeFilter !== 'all' 
                    ? 'Try adjusting your search or filters.' 
                    : 'Try adjusting your search or add a new subject.'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageSujets;