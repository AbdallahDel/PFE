import React, { useState } from 'react';
import { 
  User, 
  Home, 
  FileText, 
  Users, 
  Calendar, 
  Settings, 
  LogOut
} from 'lucide-react';
import SupervisorSideBar from './SupervisorSideBar';
import SupervisorHeader from './SupervisorHeader';

export default function SupervisorDashboard() {
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <SupervisorHeader/>            
      <div className="flex flex-1">
        <SupervisorSideBar/>
        {/* Main content */}
        <main className="flex-1 p-4">
          <div className="bg-white shadow rounded p-4 mb-4">
            <h2 className="text-lg font-medium text-gray-800">Welcome to Supervisor System</h2>
            <p className="text-gray-600">Use the sidebar to navigate through different sections</p>
          </div>
          
          {/* Simple profile card */}
          <div className="bg-white shadow rounded p-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold mr-3">
                SV
              </div>
              <div>
                <h3 className="font-medium">Supervisor Name</h3>
                <p className="text-sm text-gray-500">Department</p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('/supervisor-profile')}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded text-sm"
            >
              View Profile
            </button>
          </div>
        </main>
      </div>
      
      {/* Logout confirmation modal */}
      
    </div>
  );
}