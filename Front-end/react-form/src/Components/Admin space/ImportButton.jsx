import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';

const ImportButton = ({ onImport, userRole = 'student' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);

  // Field mapping for case-insensitive matching
  const fieldMappings = {
    student: {
      'matricule': ['matricule', 'student_id', 'id', 'student_number'],
      'nom': ['nom', 'lastname', 'last_name', 'surname', 'family_name'],
      'prenom': ['prenom', 'firstname', 'first_name', 'given_name'],
      'level': ['level', 'niveau', 'grade', 'year', 'class'],
      'binome_id': ['binome_id', 'team_id', 'group_id', 'pair_id'],
      'Password': ['password', 'pwd', 'pass']
    },
    supervisor: {
      'nom': ['nom', 'lastname', 'last_name', 'surname', 'family_name'],
      'prenom': ['prenom', 'firstname', 'first_name', 'given_name'],
      'Email': ['email', 'mail', 'e_mail', 'email_address'],
      'Grade': ['grade', 'title', 'position', 'rank'],
      'Password': ['password', 'pwd', 'pass']
    }
  };

  // Normalize field names (case-insensitive mapping)
  const normalizeData = (rawData, role) => {
    const mappings = fieldMappings[role] || fieldMappings.student;
    
    return rawData.map((row, index) => {
      const normalizedRow = { Role: role };
      const rowErrors = [];

      // Convert all keys to lowercase for comparison
      const lowerCaseRow = {};
      Object.keys(row).forEach(key => {
        lowerCaseRow[key.toLowerCase().trim()] = row[key];
      });

      // Map fields based on our mappings
      Object.entries(mappings).forEach(([targetField, possibleNames]) => {
        let found = false;
        for (const possibleName of possibleNames) {
          if (lowerCaseRow[possibleName.toLowerCase()]) {
            normalizedRow[targetField] = String(lowerCaseRow[possibleName.toLowerCase()]).trim();
            found = true;
            break;
          }
        }
        
        // Check for required fields
        if (!found) {
          const requiredFields = role === 'student' 
            ? ['matricule', 'nom', 'prenom', 'Password']
            : ['nom', 'prenom', 'Email', 'Password'];
          
          if (requiredFields.includes(targetField)) {
            rowErrors.push(`Missing required field: ${targetField}`);
          }
        }
      });

      // Add row-specific validation
      if (role === 'student') {
        // Validate matricule format if needed
        if (normalizedRow.matricule && normalizedRow.matricule.length < 3) {
          rowErrors.push('Matricule too short');
        }
        
        // Set default level if not provided
        if (!normalizedRow.level) {
          normalizedRow.level = 'licence'; // default value
        }
      } else if (role === 'supervisor') {
        // Validate email format
        if (normalizedRow.Email && !normalizedRow.Email.includes('@')) {
          rowErrors.push('Invalid email format');
        }
      }

      return {
        ...normalizedRow,
        _rowIndex: index + 1,
        _errors: rowErrors
      };
    });
  };

  const handleFileRead = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsProcessing(true);
    setErrors([]);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let data = [];
        
        if (file.name.endsWith('.csv')) {
          // Handle CSV files
          const text = event.target.result;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            throw new Error('CSV file must have at least a header row and one data row');
          }
          
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });
        } else {
          // Handle Excel files
          const wb = XLSX.read(event.target.result, { 
            type: 'binary',
            // Remove sheetRows limit to read all data
            cellDates: true,
            cellNF: false,
            cellText: false
          });
          
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          data = XLSX.utils.sheet_to_json(ws, {
            header: 1, // Get raw data first
            defval: '' // Default value for empty cells
          });
          
          // Convert array of arrays to array of objects
          if (data.length > 0) {
            const headers = data[0];
            data = data.slice(1).map(row => {
              const obj = {};
              headers.forEach((header, index) => {
                obj[header] = row[index] || '';
              });
              return obj;
            }).filter(row => Object.values(row).some(val => val !== '')); // Remove empty rows
          }
        }
        
        if (data.length === 0) {
          throw new Error('No data found in file');
        }
        
        console.log("Raw imported data:", data);
        console.log("Number of rows:", data.length);
        console.log("First row keys:", data.length > 0 ? Object.keys(data[0]) : 'No data');
        console.log("User role:", userRole);
        
        // Normalize the data
        const normalizedData = normalizeData(data, userRole);
        console.log("Normalized data:", normalizedData);
        console.log("Validation results:", normalizedData.map(row => ({
          row: row._rowIndex,
          errors: row._errors,
          hasRequiredFields: Object.keys(row).filter(key => !key.startsWith('_'))
        })));
        
        // Separate valid and invalid rows
        const validRows = normalizedData.filter(row => row._errors.length === 0);
        const invalidRows = normalizedData.filter(row => row._errors.length > 0);
        
        // Collect all error messages
        let allErrors = [];
        
        if (invalidRows.length > 0) {
          const errorMessages = invalidRows.map(row => 
            `Row ${row._rowIndex}: ${row._errors.join(', ')}`
          );
          allErrors = [...allErrors, ...errorMessages];
        }
        
        if (validRows.length > 0) {
          // Remove internal fields before preview
          const cleanData = validRows.map(row => {
            const { _rowIndex, _errors, ...cleanRow } = row;
            return cleanRow;
          });
          
          setPreviewData(cleanData);
          setShowPreview(true);
          
          // If we have valid rows but also errors, show both
          if (allErrors.length > 0) {
            allErrors.unshift(`Successfully processed ${validRows.length} rows. Issues found:`);
            setErrors(allErrors);
          }
        } else {
          // Only show "No valid rows" if we have no specific errors
          if (allErrors.length === 0) {
            allErrors.push('No valid rows found in the imported file. Please check the file format and required fields.');
          }
          setErrors(allErrors);
        }
        
      } catch (error) {
        console.error("Error importing file:", error);
        setErrors([`Import failed: ${error.message}`]);
      } finally {
        setIsProcessing(false);
        // Reset file input
        e.target.value = '';
      }
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const confirmImport = () => {
    if (onImport && previewData.length > 0) {
      onImport(previewData);
      setShowPreview(false);
      setPreviewData([]);
      setErrors([]);
    }
  };

  const cancelImport = () => {
    setShowPreview(false);
    setPreviewData([]);
    setErrors([]);
  };

  return (
    <>
      <div className="relative">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileRead}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        <button 
          className={`px-4 py-2 rounded-md flex items-center text-white ${
            isProcessing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={isProcessing}
        >
          <Upload size={16} className="mr-2" />
          {isProcessing ? 'Processing...' : 'Import'}
        </button>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center mb-4">
              <AlertCircle className="text-red-500 mr-2 flex-shrink-0" size={20} />
              <h3 className="text-lg font-semibold text-red-700">Import Issues</h3>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800 font-medium mb-2">Expected fields for {userRole}:</p>
              <div className="text-xs text-blue-700">
                {userRole === 'student' ? (
                  <div>
                    <strong>Required:</strong> matricule, nom, prenom, Password<br/>
                    <strong>Optional:</strong> level, binome_id<br/>
                    <strong>Accepted column names:</strong> matricule/student_id/id, nom/lastname/surname, prenom/firstname, Password/pwd/pass, level/niveau/grade, binome_id/team_id/group_id
                  </div>
                ) : (
                  <div>
                    <strong>Required:</strong> nom, prenom, Email, Password<br/>
                    <strong>Optional:</strong> Grade<br/>
                    <strong>Accepted column names:</strong> nom/lastname/surname, prenom/firstname, Email/mail/e_mail, Password/pwd/pass, Grade/title/position
                  </div>
                )}
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto mb-4 border border-gray-200 rounded-md">
              {errors.map((error, index) => (
                <div key={index} className="text-sm text-red-600 p-2 border-b border-gray-100 last:border-b-0">
                  {error}
                </div>
              ))}
            </div>
            <button
              onClick={() => setErrors([])}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CheckCircle className="text-green-500 mr-2" size={20} />
                <h3 className="text-lg font-semibold">Import Preview</h3>
              </div>
              <button onClick={cancelImport} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Found {previewData.length} valid records. Review and confirm to import.
            </p>
            
            <div className="flex-1 overflow-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {previewData.length > 0 && Object.keys(previewData[0]).map(key => (
                      key !== 'Role' && (
                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key}
                        </th>
                      )
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      {Object.entries(row).map(([key, value]) => (
                        key !== 'Role' && (
                          <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {String(value)}
                          </td>
                        )
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 10 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  ... and {previewData.length - 10} more records
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelImport}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmImport}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                Import {previewData.length} Records
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportButton;