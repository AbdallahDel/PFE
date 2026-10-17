import React, { useState, useEffect } from 'react';
import { CheckCircle, X, User, Users, FileText } from 'lucide-react';
import SupervisorHeader from './SupervisorHeader';
import SupervisorSideBar from './supervisorSideBar';

export default function ProjectRequests() {
  const [projectRequests, setProjectRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Fetch project requests
  const fetchProjectRequests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost/PFE/Back-end/getSupervisorProjectRequests.php', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API Response:", data);
      
      if (data.status === 'success') {
        if (data.requests && Array.isArray(data.requests)) {
          setProjectRequests(data.requests);
          console.log("Project requests loaded:", data.requests.length);
        } else {
          console.warn("No project requests returned from API or invalid format");
          setProjectRequests([]);
        }
      } else {
        setError(data.message || 'Failed to fetch project requests');
        console.error("API returned error:", data.message);
      }
    } catch (err) {
      setError('Error fetching project requests: ' + err.message);
      console.error('Error fetching project requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchProjectRequests();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateString;
    }
  };

  // Handle view project details
  const handleViewProject = (projectId) => {
    // Navigate to project details page or open modal
    window.open(`/supervisor/projects/${projectId}`, '_blank');
  };

  // Handle view binome details
  const handleViewBinome = (binomeId) => {
    // Navigate to binome details page or open modal
    window.open(`/supervisor/binomes/${binomeId}`, '_blank');
  };

  // Handle accept project request
  const handleAcceptRequest = async (choiceId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir accepter cette demande?')) {
      return;
    }
    
    try {
      const response = await fetch('http://localhost/PFE/Back-end/acceptProjectRequest.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ choiceId })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setSuccessMessage('Demande acceptée avec succès! L\'étudiant doit maintenant confirmer son choix.');
        
        // Refresh project requests list
        fetchProjectRequests();
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        alert(data.message || 'Une erreur est survenue lors de l\'acceptation de la demande');
      }
    } catch (err) {
      console.error('Error accepting request:', err);
      alert('Une erreur est survenue lors de la connexion au serveur');
    }
  };

  // Handle reject project request
  const handleRejectRequest = async (choiceId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir rejeter cette demande?')) {
      return;
    }
    
    try {
      const response = await fetch('http://localhost/PFE/Back-end/rejectProjectRequest.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ choiceId })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setSuccessMessage('Demande rejetée avec succès.');
        
        // Refresh project requests list
        fetchProjectRequests();
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        alert(data.message || 'Une erreur est survenue lors du rejet de la demande');
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Une erreur est survenue lors de la connexion au serveur');
    }
  };

  // Group requests by project title
  const groupedRequests = projectRequests.reduce((acc, request) => {
    const key = request.project_id.toString();
    
    if (!acc[key]) {
      acc[key] = {
        project_id: request.project_id,
        title: request.project_title,
        requests: []
      };
    }
    
    acc[key].requests.push(request);
    return acc;
  }, {});

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <SupervisorHeader />
      
      <div className="flex flex-1">
        <SupervisorSideBar />
        
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-blue-600 mb-6">Demandes d'encadrement</h1>
          
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded flex items-start">
              <CheckCircle size={20} className="mr-2 mt-1 flex-shrink-0" />
              <div>{successMessage}</div>
            </div>
          )}
          
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">Chargement...</div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow p-6 text-red-500">{error}</div>
          ) : Object.keys(groupedRequests).length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Aucune demande d'encadrement pour le moment.
            </div>
          ) : (
            Object.values(groupedRequests).map((group) => (
              <div key={group.project_id} className="bg-white rounded-lg shadow mb-6">
                <div className="p-4 border-b bg-blue-50 flex justify-between items-center">
                  <div>
                    <h2 className="font-medium text-lg">{group.title}</h2>
                    <p className="text-sm text-gray-500">{group.requests.length} demande(s) pour ce projet</p>
                  </div>
                  <button
                    onClick={() => handleViewProject(group.project_id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md flex items-center text-sm"
                  >
                    <FileText size={16} className="mr-1" />
                    Détails du projet
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Binôme</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Niveau</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date de demande</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Statut</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.requests.map((request) => (
                        <tr key={request.choice_id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              <Users size={18} className="mr-2 text-gray-500" />
                              <div>
                                <div className="font-medium">{request.student_names}</div>
                                <div className="text-sm text-gray-500">{request.matricule}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 capitalize">{request.niveau}</td>
                          <td className="px-4 py-2">{formatDate(request.submitted_at)}</td>
                          <td className="px-4 py-2">
                            {request.status === 'en attente' && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                En attente
                              </span>
                            )}
                            {request.status === 'accepted by supervisor' && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Accepté, en attente de confirmation
                              </span>
                            )}
                            {request.status === 'confirmed' && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                Confirmé
                              </span>
                            )}
                            {request.status === 'rejected' && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                Rejeté
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewBinome(request.binome_id)}
                                className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md flex items-center"
                                title="Voir les détails du binôme"
                              >
                                <User size={16} />
                              </button>
                              
                              {request.status === 'en attente' && (
                                <>
                                  <button
                                    onClick={() => handleAcceptRequest(request.choice_id)}
                                    className="p-1 bg-green-100 hover:bg-green-200 text-green-600 rounded-md flex items-center"
                                    title="Accepter la demande"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  
                                  <button
                                    onClick={() => handleRejectRequest(request.choice_id)}
                                    className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-md flex items-center"
                                    title="Rejeter la demande"
                                  >
                                    <X size={16} />
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
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}