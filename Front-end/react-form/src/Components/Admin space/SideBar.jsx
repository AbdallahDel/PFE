import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function SideBar() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <div className="h-full bg-white border-r w-48">
      <div className="p-4">
        <div className="space-y-2">
          <Link to='/Admin'>
            <div className={`px-3 py-2 text-sm rounded cursor-pointer transition-colors ${
              currentPath === '/Admin' 
                ? 'text-white bg-indigo-500' 
                : 'text-slate-600 hover:bg-indigo-50'
            }`}>
              Dashboard
            </div>
          </Link>

          <Link to='/manageUsers'>
            <div className={`px-3 py-2 text-sm rounded cursor-pointer transition-colors ${
              currentPath === '/manageUsers' 
                ? 'text-white bg-indigo-500' 
                : 'text-slate-600 hover:bg-indigo-50'
            }`}>
              Manage Students
            </div>
          </Link>
          
          <Link to='/projects'>
            <div className={`px-3 py-2 text-sm rounded cursor-pointer transition-colors ${
              currentPath === '/projects' 
                ? 'text-white bg-indigo-500' 
                : 'text-slate-600 hover:bg-indigo-50'
            }`}>
              Projects
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}