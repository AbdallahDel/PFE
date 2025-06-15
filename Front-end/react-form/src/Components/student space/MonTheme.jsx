import React, { useState, useEffect } from 'react';
import { FileText, Download, Users, AlertCircle, BookOpen } from 'lucide-react';
import StudentHeader from './StudentHeader';
import StudentSidebar from './StudentSideBar';

export default function MonTheme() {
  const [projectData, setProjectData] = useState(null);
  const [binomeMembers, setBinomeMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignedProject();
  }, []);

  const fetchAssignedProject = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/getMonTheme.php', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setProjectData(data.project);
        setBinomeMembers(data.binomeMembers || []);
      } else {
        setError(data.message || 'Failed to fetch project data');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error loading your assigned project: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFile = () => {
    if (projectData && projectData.file_path) {
      window.open(`http://localhost:8000/${projectData.file_path}`, '_blank');
    } else {
      alert('Aucun fichier disponible pour ce thème.');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="animate-pulse">Chargement des données du projet...</div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <AlertCircle size={32} className="text-red-500 mx-auto mb-2" />
          <h2 className="text-lg font-semibold mb-1">Erreur</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      );
    }
    
    if (!projectData) {
      return (
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <BookOpen size={32} className="text-blue-500 mx-auto mb-2" />
          <h2 className="text-lg font-semibold mb-1">Aucun projet affecté</h2>
          <p className="text-gray-600">Vous n'avez pas encore de projet affecté. Veuillez d'abord soumettre et confirmer vos choix de thèmes.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {/* Project Details Card */}
        <div className="bg-white rounded-lg shadow">
          <div className="bg-blue-600 px-4 py-2">
            <h2 className="font-bold text-white">Détails du Projet</h2>
          </div>
          
          <div className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <FileText size={16} className="mr-1 text-blue-600" />
                  Informations du Projet
                </h3>
                
                <dl className="space-y-1">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Titre</dt>
                    <dd className="font-semibold">{projectData.title}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd>{projectData.type}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Niveau</dt>
                    <dd>{projectData.niveau}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">État</dt>
                    <dd>{projectData.Etat}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Users size={16} className="mr-1 text-blue-600" />
                  Encadrement
                </h3>
                
                <dl className="space-y-1">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Encadrant</dt>
                    <dd>{projectData.supervisor_name || 'Non assigné'}</dd>
                  </div>
                </dl>
                
                {projectData.file_path && (
                  <div className="mt-3">
                    <button
                      onClick={handleDownloadFile}
                      className="flex items-center w-full py-1 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                      <Download size={16} className="mr-1" />
                      Télécharger le sujet
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {projectData.description && (
              <div className="mt-3">
                <h3 className="font-semibold mb-1">Description</h3>
                <div className="bg-gray-50 p-2 rounded-md text-sm">
                  <p className="text-gray-700">{projectData.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Team Members Card */}
        <div className="bg-white rounded-lg shadow">
          <div className="bg-blue-600 px-4 py-2">
            <h2 className="font-bold text-white">Membres de l'Équipe</h2>
          </div>
          
          <div className="p-4">
            {binomeMembers.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {binomeMembers.map((member, index) => (
                  <div key={index} className="py-2 flex flex-col sm:flex-row sm:justify-between">
                    <div>
                      <p className="font-medium">Nom: {member.nom}</p>
                      <p className="font-medium">Prenom: {member.prenom}</p>
                      <p className="text-sm text-gray-500">Matricule: {member.matricule}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-sm text-gray-500">{member.Email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-2 text-sm">Aucune information sur les membres de l'équipe disponible.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <StudentHeader />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-4">
          <div className="mb-3">
            <h1 className="text-xl font-bold text-blue-600">Mon Theme PFE</h1>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}