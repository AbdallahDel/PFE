import React, { useState, useEffect } from 'react';
import { FileText, Users, AlertCircle, BookOpen, Download, Eye } from 'lucide-react';
import SupervisorHeader from './SupervisorHeader';
import SupervisorSidebar from './SupervisorSideBar';

export default function MyProjects() {
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSupervisorAssignedProjects();
  }, []);

  const fetchSupervisorAssignedProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost/PFE/Back-end/getSupervisorAsignedProjects.php', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setAssignedProjects(data.projects || []);
      } else {
        setError(data.message || 'Failed to fetch assigned projects');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error loading assigned projects: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFile = (filePath) => {
    if (filePath) {
      window.open(`http://localhost/PFE/Back-end/${filePath}`, '_blank');
    } else {
      alert('Aucun fichier disponible pour ce projet.');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="animate-pulse">Chargement des projets assignés...</div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      );
    }
    
    if (assignedProjects.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <BookOpen size={48} className="text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aucun projet assigné</h2>
          <p className="text-gray-600">Aucune équipe d'étudiants n'a encore été assignée à vos projets.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {assignedProjects.map((project) => (
          <div key={project.project_id} className="bg-white rounded-lg shadow-lg">
            {/* Project Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white text-lg">{project.title}</h2>
                <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm">
                  {project.type}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              {/* Project Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-blue-600">
                    <FileText size={18} className="mr-2" />
                    Informations du Projet
                  </h3>
                  
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Niveau:</dt>
                      <dd className="text-sm font-semibold">{project.niveau}</dd>
                    </div>
                    
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">État:</dt>
                      <dd className="text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.Etat === 'Confirmé' ? 'bg-green-100 text-green-800' : 
                          project.Etat === 'En cours' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.Etat}
                        </span>
                      </dd>
                    </div>
                    
                    {project.mots_cles && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-1">Mots-clés:</dt>
                        <dd className="text-sm">
                          <div className="flex flex-wrap gap-1">
                            {project.mots_cles.split(',').map((keyword, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {keyword.trim()}
                              </span>
                            ))}
                          </div>
                        </dd>
                      </div>
                    )}
                  </dl>
                  
                  {project.file_path && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleDownloadFile(project.file_path)}
                        className="flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm"
                      >
                        <Download size={16} className="mr-2" />
                        Télécharger le sujet
                      </button>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-green-600">
                    <Users size={18} className="mr-2" />
                    Équipes Assignées ({project.binomes.length})
                  </h3>
                  
                  <div className="space-y-3">
                    {project.binomes.map((binome, binomeIndex) => (
                      <div key={binome.binome_id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-gray-700">
                            Binôme #{binome.binome_id}
                          </span>
                          <span className="text-xs text-gray-500">
                            {binome.members.length} étudiant{binome.members.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          {binome.members.map((member, memberIndex) => (
                            <div key={member.userID} className="bg-white p-2 rounded border border-gray-100">
                              <div className="flex flex-col sm:flex-row sm:justify-between">
                                <div>
                                  <p className="font-medium text-sm">{member.nom} {member.prenom}</p>
                                  <p className="text-xs text-gray-500">Matricule: {member.matricule}</p>
                                </div>
                                <div className="sm:text-right">
                                  <p className="text-xs text-gray-600">{member.Email}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Project Description */}
              {project.description && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Eye size={16} className="mr-2 text-gray-600" />
                    Description
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 text-sm leading-relaxed">{project.description}</p>
                  </div>
                </div>
              )}
              
              {/* Additional Info */}
              {(project.environnement || project.contenu) && (
                <div className="border-t pt-4 mt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {project.environnement && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Environnement:</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{project.environnement}</p>
                      </div>
                    )}
                    
                    {project.contenu && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Contenu:</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{project.contenu}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <SupervisorHeader />
      <div className="flex flex-1">
        <SupervisorSidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-blue-600">Mes Projets Assignés</h1>
            <p className="text-gray-600 mt-1">Gérez les équipes d'étudiants assignées à vos projets</p>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}