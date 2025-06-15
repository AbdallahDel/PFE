import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, X, AlertCircle } from 'lucide-react';
import StudentHeader from './StudentHeader';
import StudentSidebar from './StudentSideBar';
import { Navigate, useNavigate } from 'react-router-dom';

export default function MesChoix() {
  const [userChoices, setUserChoices] = useState([]);
  const [themeDetails, setThemeDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();
  
  // Fetch user's submitted choices
  const fetchUserChoices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/getStudentChoices.php', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.choices) {
        setUserChoices(data.choices);
        console.log("User choices loaded:", data.choices);
        
        // Extract project IDs from choices to fetch details
        const projectIds = data.choices.map(choice => choice.project_id);
        if (projectIds.length > 0) {
          fetchThemeDetails(projectIds);
        } else {
          setIsLoading(false);
        }
      } else {
        setError(data.message || 'Failed to fetch your choices');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error fetching user choices:', err);
      setError('Error loading your choices: ' + err.message);
      setIsLoading(false);
    }
  };
  
  // Fetch theme details for selected projects
  // Fetch theme details for selected projects
const fetchThemeDetails = async (projectIds) => {
  try {
    console.log("Fetching details for projects:", projectIds);
    
    const response = await fetch('http://localhost:8000/getProjectDetails.php', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectIds: projectIds }) // Ensure proper format
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server response:", errorText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Project details response:", data);
    
    if (data.status === 'success' && data.projects) {
      // Convert array to object with project_id as key for easier lookup
      const projectsMap = {};
      data.projects.forEach(project => {
        projectsMap[project.project_id] = project;
      });
      
      setThemeDetails(projectsMap);
    } else {
      throw new Error(data.message || "Failed to fetch project details");
    }
  } catch (err) {
    console.error('Error fetching project details:', err);
    setError('Error loading project details: ' + err.message);
  } finally {
    setIsLoading(false);
  }
};
  // Load user choices on component mount
  useEffect(() => {
    fetchUserChoices();
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

  // Handle file view
  const handleViewFile = (filePath) => {
    if (filePath && filePath.toLowerCase() !== 'null') {
      window.open(`http://localhost:8000/${filePath}`, '_blank');
    } else {
      alert('Aucun fichier disponible pour ce thème.');
    }
  };

  // Confirm project choice (after supervisor approval)
  const confirmProjectChoice = async (choiceId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir confirmer vos choix de thèmes?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/confirmProjectChoices.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ choiceId })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setSuccessMessage('Projet confirmé avec succès! Ce projet est maintenant votre sujet de PFE.');
        navigate('/MonTheme');
        // Refresh user choices
        fetchUserChoices();
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        alert(data.message || 'Une erreur est survenue lors de la confirmation');
      }
    } catch (err) {
      console.error('Error confirming project choice:', err);
      alert('Une erreur est survenue lors de la connexion au serveur');
    }
  };

  // Cancel submitted choices
  const cancelChoices = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler vos choix de thèmes?')) {
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8000/cancelThemeChoices.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setSuccessMessage('Vos choix ont été annulés avec succès!');
        setUserChoices([]);
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        alert(data.message || 'Une erreur est survenue lors de l\'annulation');
      }
    } catch (err) {
      console.error('Error canceling choices:', err);
      alert('Une erreur est survenue lors de la connexion au serveur');
    }
  };

  // Get status badge based on choice status
  const getStatusBadge = (status) => {
    switch(status) {
      case 'en attente':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={14} className="mr-1" />
            En attente
          </span>
        );
      case 'accepted by supervisor':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle size={14} className="mr-1" />
            Accepté par l'encadrant
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={14} className="mr-1" />
            Confirmé
          </span>
        );
      case 'validated':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={14} className="mr-1" />
            Validé par le département
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
            <X size={14} className="mr-1" />
            Rejeté
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <StudentHeader />
      
      <div className="flex flex-1">
        <StudentSidebar />
        
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-600">Mes Choix de Projets</h1>
            
            {userChoices.length > 0 && (
              <button
                onClick={cancelChoices}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center"
              >
                <X size={18} className="mr-2" />
                Annuler mes choix
              </button>
            )}
          </div>
          
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded flex items-start">
              <CheckCircle size={20} className="mr-2 mt-1 flex-shrink-0" />
              <div>{successMessage}</div>
            </div>
          )}
          
          {userChoices.length === 0 && !isLoading && (
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center text-gray-600">
              <AlertCircle size={48} className="text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Aucun choix soumis</h2>
              <p className="text-center">
                Vous n'avez pas encore soumis de choix de projets. Rendez-vous sur la page de consultation des thèmes pour faire vos choix.
              </p>
            </div>
          )}
          
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="animate-pulse">Chargement de vos choix...</div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow p-6 text-red-500">
              <AlertCircle size={20} className="inline mr-2" />
              {error}
            </div>
          ) : userChoices.length > 0 && (
            <div className="bg-white rounded-lg shadow mb-6">
              <h2 className="p-4 border-b font-medium">Vos choix de projets</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Priorité</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Titre</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Encadrant</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date de soumission</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Statut</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userChoices.map((choice, index) => {
                      const theme = themeDetails[choice.project_id] || {};
                      return (
                        <tr key={choice.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2 font-bold">
                            Choix {index + 1}
                          </td>
                          <td className="px-4 py-2 font-medium">
                            {theme.title || `Projet #${choice.project_id}`}
                          </td>
                          <td className="px-4 py-2">
                            {theme.encadrant || 'N/A'}
                          </td>
                          <td className="px-4 py-2">
                            {formatDate(choice.submitted_at)}
                          </td>
                          <td className="px-4 py-2">
                            {getStatusBadge(choice.status)}
                          </td>
                          <td className="px-4 py-2">
                            {choice.status === 'accepted by supervisor' && (
                              <button 
                                onClick={() => confirmProjectChoice(choice.id)}
                                className="py-1 px-3 rounded-md bg-green-500 text-white hover:bg-green-600"
                              >
                                Confirmer
                              </button>
                            )}
                            {choice.status === 'confirmed' && (
                              <span className="text-green-600 font-medium">
                                Projet confirmé
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}