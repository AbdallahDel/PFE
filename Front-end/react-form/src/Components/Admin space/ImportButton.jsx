import  {React, useState } from 'react';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';



const ImportButton = ({ onImport ,onImportUser}) => {

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'binary',sheetRows:5 });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        console.log("Imported data:", data);
        // Pass imported data to parent component if callback provided
        if (onImport) onImport(data);
        
      } catch (error) {
        console.error("Error importing file:", error);
      }
    };
    
    reader.readAsBinaryString(file);
  };


  return (
    <div className="relative">
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleImport}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
        <Upload size={16} className="mr-2" />
        Import
      </button>
    </div>
  );
};

export default ImportButton;