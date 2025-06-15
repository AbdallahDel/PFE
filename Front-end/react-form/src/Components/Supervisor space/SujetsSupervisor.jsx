import React, { useState, useEffect } from 'react';
import SupervisorHeader from './SupervisorHeader';
import SupervisorSideBar from './SupervisorSideBar';
import DeposerSujet from './DeposerSujet';
import { Plus, Download, Eye, Trash, Edit } from 'lucide-react';

export default function SupervisorSubjects() {
  const [showDeposerSujetModal, setShowDeposerSujetModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [error, setError] = useState(null);
  const [errorAll, setErrorAll] = useState(null);
  // Toggle between "Mes Sujets" and "Tout les sujets" views
  const [activeTab, setActiveTab] = useState('mesSubjects');
  
  const navigateTo = (path) => {
    // Navigation logic here
    console.log('Navigating to:', path);
  };

  // Function to fetch supervisor's subjects from the backend
  const fetchSubjects = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/getSuperviserSubjects.php', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setSubjects(data.subjects);
      } else {
        setError(data.message || 'Failed to fetch subjects');
      }
    } catch (err) {
      setError('Error fetching subjects: ' + err.message);
      console.error('Error fetching subjects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch all subjects (similar to admin view)
  const fetchAllSubjects = async () => {
    setIsLoadingAll(true);
    setErrorAll(null);
    
    try {
      const response = await fetch('http://localhost:8000/getSujetsInfo.php', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setAllSubjects(data);
    } catch (err) {
      setErrorAll('Error fetching all subjects: ' + err.message);
      console.error('Error fetching all subjects:', err);
    } finally {
      setIsLoadingAll(false);
    }
  };

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
    fetchAllSubjects();
  }, []);

  const handleDeposerSujetSuccess = (data) => {
    setSuccessMessage('Sujet déposé avec succès!');
    // Refresh subjects list
    fetchSubjects();
    fetchAllSubjects();
    
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Function to handle file download
  const handleViewFile = (filePath) => {
    // Assuming file path is relative to backend
    window.open(`http://localhost:8000/${filePath}`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <SupervisorHeader />
      
      <div className="flex flex-1">
        <SupervisorSideBar navigateTo={navigateTo} />
        
        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex space-x-4">
              <button 
                onClick={() => setActiveTab('mesSubjects')}
                className={`text-2xl font-bold ${activeTab === 'mesSubjects' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              >
                Mes Sujets
              </button>
              <button 
                onClick={() => setActiveTab('allSubjects')}
                className={`text-2xl font-bold ${activeTab === 'allSubjects' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              >
                Tout les Sujets
              </button>
            </div>
            
            <button
              onClick={() => setShowDeposerSujetModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Déposer un Sujet
            </button>
          </div>
          
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}
          
          {/* MY SUBJECTS VIEW */}
          {activeTab === 'mesSubjects' && (
            <div className="bg-white rounded-lg shadow">
              <h2 className="p-4 border-b font-medium">Liste des sujets déposés</h2>
              
              {isLoading ? (
                <div className="p-4 text-center">Chargement...</div>
              ) : error ? (
                <div className="p-4 text-red-500">{error}</div>
              ) : subjects.length === 0 ? (
                <div className="p-4 text-center text-gray-500">Aucun sujet trouvé.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Titre</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Niveau</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">État</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Choix</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subject) => (
                        <tr key={subject.id} className="border-t">
                          <td className="px-4 py-2">{subject.title}</td>
                          <td className="px-4 py-2 capitalize">{subject.niveau}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              subject.Etat === 'proposed' ? 'bg-gray-100 text-gray-800' : 
                              subject.Etat === 'approved' ? 'bg-green-100 text-green-800' :
                              subject.Etat === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {subject.Etat}
                            </span>
                          </td>
                          <td className="px-4 py-2">{formatDate(subject.created_at)}</td>
                          <td className="px-4 py-2">{subject.choix_count || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* ALL SUBJECTS VIEW */}
          {activeTab === 'allSubjects' && (
            <div className="bg-white rounded-lg shadow">
              <h2 className="p-4 border-b font-medium">Liste de tous les sujets</h2>
              
              {isLoadingAll ? (
                <div className="p-4 text-center">Chargement...</div>
              ) : errorAll ? (
                <div className="p-4 text-red-500">{errorAll}</div>
              ) : allSubjects.length === 0 ? (
                <div className="p-4 text-center text-gray-500">Aucun sujet trouvé.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Titre</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Niveau</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Équipe</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Encadrant</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">État</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allSubjects.map((subject) => (
                        <tr key={subject.sujetID} className="border-t">
                          <td className="px-4 py-2">{subject.titre}</td>
                          <td className="px-4 py-2 capitalize">{subject.niveau}</td>
                          <td className="px-4 py-2">{subject.equipe || 'Non assigné'}</td>
                          <td className="px-4 py-2">{subject.encadrant}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              subject.etat === 'proposed' ? 'bg-gray-100 text-gray-800' : 
                              subject.etat === 'approved' ? 'bg-green-100 text-green-800' :
                              subject.etat === 'rejected' ? 'bg-red-100 text-red-800' :
                              subject.etat === 'assigned' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {subject.etat}
                            </span>
                          </td>
                          <td className="px-4 py-2">{formatDate(subject.date_soumission)}</td>
                          <td className="px-4 py-2 space-x-2 flex">
                            {subject.has_file && (
                              <button 
                                onClick={() => handleViewFile(subject.file_path)}
                                className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md"
                                title="Voir le fichier"
                              >
                                <Eye size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Déposer Sujet Modal */}
          {showDeposerSujetModal && (
            <DeposerSujet 
              onClose={() => setShowDeposerSujetModal(false)}
              onSuccess={handleDeposerSujetSuccess}
            />
          )}
        </main>
      </div>
    </div>
  );
}