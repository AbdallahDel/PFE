import React, { useState } from 'react';
import { X, Save, Upload } from 'lucide-react';

const DeposerSujet = ({ onClose, onSuccess }) => {
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
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    // Check if file is selected
    if (!file) {
      setError('Veuillez sélectionner un fichier PDF');
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

      const response = await fetch('http://localhost:8000/deposerSujet.php', {
        method: 'POST',
        credentials: 'include',
        body: formDataObj
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        setShowSuccess(true);
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(data);
        }
      } else {
        setError(data.message || 'Failed to submit subject');
      }
    } catch (err) {
      setError('An error occurred while submitting the form: ' + err.message);
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  // Success message component
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sujet Déposé avec Succès!
            </h3>
            <p className="text-sm text-gray-500">
              Votre sujet a été déposé et sera examiné par notre équipe.
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
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Déposer un Sujet</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-4">
            {/* Project Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  id="titre"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="niveau" className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau
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
                  <option value="licence">Licence</option>
                  <option value="master">Master</option>
                  <option value="doctorat">Doctorat</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contenu" className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu
                </label>
                <select
                  id="contenu"
                  name="contenu"
                  value={formData.contenu}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un contenu</option>
                  <option value="theorique">Théorique</option>
                  <option value="pratique">Pratique</option>
                  <option value="hybrid">Hybride</option>
                </select>
              </div>

              <div>
                <label htmlFor="environnement" className="block text-sm font-medium text-gray-700 mb-1">
                  Environnement
                </label>
                <input
                  type="text"
                  id="environnement"
                  name="environnement"
                  value={formData.environnement}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: React, PHP, MySQL..."
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="motsCles" className="block text-sm font-medium text-gray-700 mb-1">
                Mots-clés
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
              />
              <small className="text-gray-500">Séparez les mots-clés par des virgules</small>
            </div>

            {/* File Upload */}
            <div className="border-t pt-4">
              <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700 mb-1">
                Document PDF (max 2MB)
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
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Fichier sélectionné:</p>
                      <p className="text-xs text-gray-500">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
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
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                    Enregistrer
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

export default DeposerSujet;