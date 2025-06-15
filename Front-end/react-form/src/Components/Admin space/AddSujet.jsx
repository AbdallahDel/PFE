import React, { useState, useEffect } from 'react';
import { X, Save, Upload } from 'lucide-react';

const AddSujet = ({ onAddSujet, onClose }) => {
  const [formData, setFormData] = useState({
    titre: '',
    niveau: '',
    encadrant: '',
    etat: 'disponible',
    description: ''
  });

  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add new state variables for file handling
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);

  // Fetch available supervisors
  useEffect(() => {
    const fetchSupervisors = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/getAvailableSupervisors.php', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.status === 'success') {
          setSupervisors(data.supervisors);
        } else {
          throw new Error(data.message || 'Failed to fetch supervisors');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching supervisors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Add file change handler
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileError(null);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Validate file type (PDF only)
    if (selectedFile.type !== 'application/pdf') {
      setFileError('Only PDF files are accepted');
      return;
    }
    
    // Validate file size (max 2MB)
    if (selectedFile.size > 2 * 1024 * 1024) {
      setFileError('File size must not exceed 2MB');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Append file if it exists
      if (file) {
        submitData.append('pdfFile', file);
        console.log('File appended:', file.name, file.size);
      }
      
      // Log FormData contents for debugging
      for (let pair of submitData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }
      
      // Direct fetch instead of using onAddSujet
      const response = await fetch('http://localhost:8000/addSujet.php', {
        method: 'POST',
        credentials: 'include',
        body: submitData, // Send FormData directly - don't set Content-Type header
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Form submission result:', result);
      
      if (result.status === 'success') {
        // Call onAddSujet with the new subject data for state update
        onAddSujet({
          sujetID: result.sujetID,
          titre: formData.titre,
          niveau: formData.niveau,
          encadrant: formData.encadrant,
          etat: 'disponible',
          description: formData.description,
          file_path: result.file_path
        });
        
        // Close the modal
        onClose();
      } else {
        throw new Error(result.message || 'Failed to add subject');
      }
    } catch (err) {
      setError('Error submitting form: ' + (err.message || 'Unknown error'));
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Subject</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
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

          <div className="mb-4">
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
              <option value="">Select level</option>
              <option value="licence">Licence</option>
              <option value="master">Master</option>
              <option value="Doctorat">Doctorat</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="encadrant" className="block text-sm font-medium text-gray-700 mb-1">
              Encadrant
            </label>
            <select
              id="encadrant"
              name="encadrant"
              value={formData.encadrant}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading || supervisors.length === 0}
            >
              <option value="">Select supervisor</option>
              {supervisors.map((supervisor) => (
                <option key={supervisor.id} value={supervisor.name}>
                  {supervisor.name} ({5 - supervisor.project_count} slots available)
                </option>
              ))}
            </select>
            {loading && <span className="text-sm text-gray-500">Loading supervisors...</span>}
            {!loading && supervisors.length === 0 && !error && (
              <span className="text-sm text-red-500">No available supervisors found</span>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="etat" className="block text-sm font-medium text-gray-700 mb-1">
              Etat
            </label>
            <select
              id="etat"
              name="etat"
              value={formData.etat}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="disponible">Disponible</option>
              <option value="attribué">Attribué</option>
              <option value="en cours">En cours</option>
              <option value="terminé">Terminé</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="mb-4">
            <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700 mb-1">
              Document PDF (optional, max 2MB)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload size={24} className="mx-auto text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="pdfFile" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input
                      id="pdfFile"
                      name="pdfFile"
                      type="file"
                      className="sr-only"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF only, up to 2MB</p>
                {file && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected file:</p>
                    <p className="text-xs text-gray-500">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                  </div>
                )}
              </div>
            </div>
            {fileError && (
              <p className="mt-2 text-sm text-red-600">{fileError}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || fileError || (supervisors.length === 0)}
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSujet;