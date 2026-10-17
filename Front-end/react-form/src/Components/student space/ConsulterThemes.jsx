import React, { useState, useEffect } from 'react';
import { Eye, Check, AlertCircle, Clock, CheckCircle, X } from 'lucide-react';
import StudentHeader from './StudentHeader';
import StudentSidebar from './StudentSideBar';
import { useNavigate } from 'react-router-dom';

export default function ConsulterThemes() {
  const [themeInternes, setThemeInternes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [userChoices, setUserChoices] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySelectedProjects, setAlreadySelectedProjects] = useState([]);
  const navigate = useNavigate();
  
  // Fetch internal themes
  const fetchThemesInternes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost/PFE/Back-end/getInternSujets.php', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API Response:", data); // Debug: Log the entire response
      
      if (data.status === 'success') {
        // Check if themes are present and non-empty
        if (data.themes && Array.isArray(data.themes)) {
          setThemeInternes(data.themes);
          console.log("Themes loaded:", data.themes.length);
        } else {
          console.warn("No themes returned from API or invalid format");
          setThemeInternes([]);
        }
        
        // Set student's already chosen themes for new selections
        if (data.available_for_selection && Array.isArray(data.available_for_selection)) {
          setSelectedThemes(data.available_for_selection);
          console.log("Available themes for selection:", data.available_for_selection);
        }
      } else {
        setError(data.message || 'Failed to fetch themes');
        console.error("API returned error:", data.message);
      }
    } catch (err) {
      setError('Error fetching themes: ' + err.message);
      console.error('Error fetching themes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's submitted choices
  const fetchUserChoices = async () => {
    try {
      const response = await fetch('http://localhost/PFE/Back-end/getUserChoices.php', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.choices) {
        setUserChoices(data.choices);
        console.log("User submitted choices:", data.choices);
        
        // Extract project IDs that are already chosen by students
        const projectIds = data.choices.map(choice => choice.project_id);
        setAlreadySelectedProjects(projectIds);
      }
    } catch (err) {
      console.error('Error fetching user choices:', err);
    }
  };

  // Fetch data about already selected projects
  const fetchAlreadySelectedProjects = async () => {
    try {
      const response = await fetch('http://localhost/PFE/Back-end/getAlreadySelectedProjects.php', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.projects) {
        setAlreadySelectedProjects(data.projects);
        console.log("Already selected projects:", data.projects);
      }
    } catch (err) {
      console.error('Error fetching already selected projects:', err);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchThemesInternes();
    fetchUserChoices();
    fetchAlreadySelectedProjects();
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

  // Handle view file (PDF)
  const handleViewFile = (filePath) => {
    if (filePath && filePath.toLowerCase() !== 'null') {
      window.open(`http://localhost/PFE/Back-end/${filePath}`, '_blank');
    } else {
      alert('Aucun fichier disponible pour ce thème.');
    }
  };

  // Toggle theme selection
  const toggleThemeSelection = (themeId) => {
    // Check if user already has submitted choices
    if (userChoices.length > 0) {
      alert('Vous avez déjà soumis des choix. Veuillez consulter la page "Mes Choix" pour voir le statut de vos sélections.');
      return;
    }
    
    // Check if the project is already confirmed by another student
    if (alreadySelectedProjects.includes(themeId)) {
      alert('Ce projet a déjà été sélectionné et confirmé par un autre étudiant.');
      return;
    }
    
    // Maximum 3 choices allowed
    if (selectedThemes.includes(themeId)) {
      setSelectedThemes(selectedThemes.filter(id => id !== themeId));
    } else {
      if (selectedThemes.length < 3) {
        setSelectedThemes([...selectedThemes, themeId]);
      } else {
        alert('Vous pouvez sélectionner au maximum 3 thèmes');
      }
    }
  };

  // Submit theme choices
  const submitChoices = async () => {
     if (!window.confirm('Êtes-vous sûr de submiter vos choix ?')) {
      return;
    }
    if (selectedThemes.length === 0) {
      alert('Veuillez sélectionner au moins un thème');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('http://localhost/PFE/Back-end/submitThemeChoices.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ themeIds: selectedThemes })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setSuccessMessage('Vos choix ont été soumis avec succès! Les encadrants ont été notifiés.');
        
        // Navigate to "Mes Choix" page
        
      } else {
        alert(data.message || 'Une erreur est survenue lors de la soumission');
      }
    } catch (err) {
      console.error('Error submitting choices:', err);
      alert('Une erreur est survenue lors de la connexion au serveur');
    } finally {
      setSubmitting(false);
    }
  };

  // Determine if user can select new themes
  const canSelectThemes = userChoices.length === 0;

  // Check if a theme is already selected and confirmed by another student
  const isThemeUnavailable = (themeId) => {
    return alreadySelectedProjects.includes(themeId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <StudentHeader />
      
      <div className="flex flex-1">
        <StudentSidebar />
        
        <main className="flex-1 p-6">
          {/* Available themes section */}
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Thèmes Internes</h1>
            
            {canSelectThemes && selectedThemes.length > 0 && (
              <button
                onClick={submitChoices}
                disabled={submitting}
                className={`${
                  submitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                } text-white py-2 px-4 rounded-md flex items-center`}
              >
                {submitting ? (
                  <>Soumission en cours...</>
                ) : (
                  <>
                    <Check size={18} className="mr-2" />
                    Soumettre mes choix ({selectedThemes.length}/3)
                  </>
                )}
              </button>
            )}
          </div>
          
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded flex items-start">
              <CheckCircle size={20} className="mr-2 mt-1 flex-shrink-0" />
              <div>{successMessage}</div>
            </div>
          )}
          
          {!canSelectThemes && (
            <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded flex items-start">
              <AlertCircle size={20} className="mr-2 mt-1 flex-shrink-0" />
              <div>
                Vous avez déjà soumis des choix de thèmes. Veuillez consulter la page <a href="/student/mes-choix" className="font-bold underline">Mes Choix</a> pour voir le statut de vos sélections.
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow">
            <h2 className="p-4 border-b font-medium">Liste des thèmes internes disponibles</h2>
            
            {isLoading ? (
              <div className="p-4 text-center">Chargement...</div>
            ) : error ? (
              <div className="p-4 text-red-500">{error}</div>
            ) : themeInternes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Aucun thème disponible pour le moment.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">ID</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Titre</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Niveau</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Encadrant</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Nombre de sélections</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Fichier</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {themeInternes.map((theme) => {
                      const isUnavailable = isThemeUnavailable(theme.project_id);
                      return (
                        <tr key={theme.project_id} className={`border-t hover:bg-gray-50 ${isUnavailable ? 'bg-gray-100' : ''}`}>
                          <td className="px-4 py-2">{theme.project_id}</td>
                          <td className="px-4 py-2 font-medium">{theme.title}</td>
                          <td className="px-4 py-2 capitalize">{theme.niveau}</td>
                          <td className="px-4 py-2">{theme.encadrant}</td>
                          <td className="px-4 py-2">{formatDate(theme.created_at)}</td>
                          <td className="px-4 py-2">{theme.selection_count}</td>
                          <td className="px-4 py-2">
                            {theme.file_path && theme.file_path !== 'NULL' && (
                              <button 
                                onClick={() => handleViewFile(theme.file_path)}
                                className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md flex items-center"
                                title="Voir le fichier PDF"
                              >
                                <Eye size={16} className="mr-1" />
                                <span>PDF</span>
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {canSelectThemes ? (
                              isUnavailable ? (
                                <span className="py-1 px-3 rounded-md bg-red-100 text-red-600 border border-red-300">
                                  Déjà attribué
                                </span>
                              ) : (
                                <button 
                                  onClick={() => toggleThemeSelection(theme.project_id)}
                                  className={`py-1 px-3 rounded-md ${
                                    selectedThemes.includes(theme.project_id) 
                                      ? 'bg-green-100 text-green-600 border border-green-300' 
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {selectedThemes.includes(theme.project_id) ? 'Sélectionné' : 'Choisir'}
                                </button>
                              )
                            ) : (
                              <button 
                                disabled
                                className="py-1 px-3 rounded-md bg-gray-100 text-gray-400 cursor-not-allowed"
                              >
                                Choisir
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}