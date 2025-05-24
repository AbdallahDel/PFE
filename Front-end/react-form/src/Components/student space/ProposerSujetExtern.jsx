import React, { useState } from 'react';
import { X, Save, Upload, Plus, FileText, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import StudentHeader from '../student space/StudentHeader';
import StudentSidebar from '../student space/StudentSidebar';

const ProposerSujetExtern = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    titre: '',
    niveau: '',
    description: '',
    contenu: '',
    environnement: '',
    motsCles: ''
  });

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear errors when user starts typing
    if (error) {
      setError(null);
      setErrorType(null);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileError(null);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Validate file type (PDF only)
    if (selectedFile.type !== 'application/pdf') {
      setFileError('Seuls les fichiers PDF sont acceptés');
      return;
    }
    
    // Validate file size (max 2MB)
    if (selectedFile.size > 2 * 1024 * 1024) {
      setFileError('Le fichier ne doit pas dépasser 2MB');
      return;
    }
    
    setFile(selectedFile);
  };

  const validateForm = () => {
    const requiredFields = {
      titre: 'Titre',
      niveau: 'Niveau',
      description: 'Description',
      contenu: 'Contenu',
      environnement: 'Environnement',
      motsCles: 'Mots-clés'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field].trim()) {
        setError(`Le champ "${label}" est obligatoire.`);
        setErrorType('validation');
        return false;
      }
    }

    if (!file) {
      setError('Veuillez sélectionner un fichier PDF');
      setErrorType('validation');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setErrorType(null);

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Create FormData object and append all form values
      const formDataObj = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key]);
      });
      
      // Append file
      if (file) {
        formDataObj.append('pdfFile', file);
      }

      const response = await fetch('http://localhost/PFE/Back-end/proposerSujetExtern.php', {
        method: 'POST',
        credentials: 'include',
        body: formDataObj
      });

      // Get response text first
      const responseText = await response.text();
      
      // Try to parse as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Response is not valid JSON:', responseText);
        throw new Error('Réponse du serveur invalide');
      }

      if (response.ok && responseData.status === 'success') {
        // Success case
        setShowSuccess(true);
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(responseData);
        }
      } else {
        // Handle error cases
        handleErrorResponse(response.status, responseData);
      }
      
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Une erreur de connexion s\'est produite. Veuillez vérifier votre connexion et réessayer.');
      setErrorType('network');
    } finally {
      setLoading(false);
    }
  };

  const handleErrorResponse = (status, responseData) => {
    let message = responseData?.message || 'Une erreur s\'est produite';
    let type = 'error';
    
    // Handle specific error types from your PHP backend
    if (responseData?.error_type) {
      switch (responseData.error_type) {
        case 'project_already_assigned':
          type = 'warning';
          message = responseData.message;
          break;
        case 'pending_choices_exist':
          type = 'warning';
          message = responseData.message;
          break;
        case 'student_already_assigned':
          type = 'warning';
          message = responseData.message;
          break;
        default:
          type = 'error';
      }
    } else {
      // Handle HTTP status codes
      switch (status) {
        case 400:
          type = 'warning';
          break;
        case 401:
          message = 'Vous devez être connecté pour effectuer cette action.';
          type = 'auth';
          break;
        case 405:
          message = 'Méthode non autorisée';
          type = 'error';
          break;
        case 500:
          message = 'Erreur serveur. Veuillez réessayer plus tard.';
          type = 'error';
          break;
        default:
          type = 'error';
      }
    }
    
    setError(message);
    setErrorType(type);
    
    // Log debug information if available
    if (responseData?.debug) {
      console.log('Debug info:', responseData.debug);
    }
  };

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />;
      case 'auth':
        return <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />;
      case 'validation':
        return <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />;
    }
  };

  const getErrorStyle = () => {
    switch (errorType) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'auth':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  // Success message component
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Proposition Soumise avec Succès!
            </h3>
            <p className="text-sm text-gray-500">
              Votre proposition de sujet externe a été envoyée et sera examinée par notre équipe.
              Vous ne pourrez plus proposer d'autres projets tant que celui-ci est en cours d'évaluation.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Proposer un Sujet Externe</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Warning message about restrictions */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important :</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Vous ne pouvez proposer qu'un seul projet externe à la fois</li>
                <li>Une fois soumis, vous ne pourrez plus proposer d'autres projets jusqu'à ce que celui-ci soit traité</li>
                <li>L'annulation n'est possible que si le projet n'a pas été validé par l'administration</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className={`mb-4 p-3 border rounded-lg flex items-start ${getErrorStyle()}`}>
            {getErrorIcon()}
            <div className="text-sm">
              <div className="font-medium mb-1">
                {errorType === 'warning' && 'Attention'}
                {errorType === 'auth' && 'Authentification requise'}
                {errorType === 'validation' && 'Erreur de validation'}
                {(errorType === 'error' || errorType === 'network') && 'Erreur'}
              </div>
              <div>{error}</div>
              {errorType === 'auth' && (
                <div className="mt-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm underline hover:no-underline"
                  >
                    Actualiser la page
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-4">
            {/* Project Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="titre"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  maxLength="255"
                />
              </div>

              <div>
                <label htmlFor="niveau" className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau <span className="text-red-500">*</span>
                </label>
                <select
                  id="niveau"
                  name="niveau"
                  value={formData.niveau}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un niveau</option>
                  <option value="Débutant">Débutant</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                  <option value="Avancé">Avancé</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Décrivez votre projet en détail..."
                required
                maxLength="1000"
              ></textarea>
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.description.length}/1000
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contenu" className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu détaillé <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="contenu"
                  name="contenu"
                  value={formData.contenu}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Décrivez en détail le contenu du projet..."
                  required
                  maxLength="5000"
                ></textarea>
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.contenu.length}/5000
                </div>
              </div>

              <div>
                <label htmlFor="environnement" className="block text-sm font-medium text-gray-700 mb-1">
                  Environnement technique <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="environnement"
                  name="environnement"
                  value={formData.environnement}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Technologies, outils, frameworks utilisés..."
                  required
                  maxLength="1000"
                ></textarea>
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.environnement.length}/1000
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="motsCles" className="block text-sm font-medium text-gray-700 mb-1">
                Mots-clés <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="motsCles"
                name="motsCles"
                value={formData.motsCles}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: web, sécurité, intelligence artificielle..."
                required
                maxLength="255"
              />
              <small className="text-gray-500">Séparez les mots-clés par des virgules</small>
            </div>

            {/* File Upload */}
            <div className="border-t pt-4">
              <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700 mb-1">
                Document PDF <span className="text-red-500">*</span> (max 2MB)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload size={24} className="mx-auto text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="pdfFile" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Télécharger un fichier</span>
                      <input
                        id="pdfFile"
                        name="pdfFile"
                        type="file"
                        className="sr-only"
                        accept=".pdf"
                        onChange={handleFileChange}
                        required
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF uniquement, 2MB max</p>
                  {file && (
                    <div className="mt-2 p-2 bg-green-50 rounded-md">
                      <p className="text-sm text-green-600 font-medium">Fichier sélectionné:</p>
                      <p className="text-xs text-green-700">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                    </div>
                  )}
                </div>
              </div>
              {fileError && (
                <p className="mt-2 text-sm text-red-600">{fileError}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || fileError}
              >
                {loading ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement...
                  </span>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Soumettre
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main interface component
const ProposerSujetExternInterface = () => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSuccess = (data) => {
    console.log('External subject submitted successfully:', data);
    setShowModal(false); // Close modal on success
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <StudentHeader />
      
      <div className="flex flex-1">
        <StudentSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <FileText size={48} className="mx-auto text-blue-600 mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Proposition de Sujet Externe
              </h1>
              <p className="text-gray-600">
                Proposez un sujet de projet externe
              </p>
            </div>

            <button
              onClick={handleOpenModal}
              className="flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Proposer un Sujet Externe
            </button>

            <div className="mt-6 text-sm text-gray-500">
              <p>
                Vous pouvez deposer un seul sujet externe!
              </p>
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <ProposerSujetExtern
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default ProposerSujetExternInterface;