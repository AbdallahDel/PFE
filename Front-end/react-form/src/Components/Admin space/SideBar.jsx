import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom';

export default function SideBar() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <div>
      <div className="w-48 bg-white border-r">
        <div className="p-4">
          <div className="space-y-2">
            <Link to='/manageUsers'>
              <div className={`px-3 py-2 text-sm rounded cursor-pointer transition-colors ${
                currentPath === '/manageUsers' 
                  ? 'text-white bg-indigo-500' 
                  : 'text-slate-600 hover:bg-indigo-50'
              }`}>
                Manage Students
              </div>
            </Link>
            
            <Link to='/manageSupervisor'> 
              <div className={`px-3 py-2 text-sm rounded cursor-pointer transition-colors ${
                currentPath === '/manageSupervisor' 
                  ? 'text-white bg-indigo-500' 
                  : 'text-slate-600 hover:bg-indigo-50'
              }`}>
                Manage supervisors
              </div>
            </Link>
            
            <Link to='/security'>
              <div className={`px-3 py-2 text-sm rounded cursor-pointer transition-colors ${
                currentPath === '/security' 
                  ? 'text-white bg-indigo-500' 
                  : 'text-slate-600 hover:bg-indigo-50'
              }`}>
                Security
              </div>
            </Link>
            
            <Link to='/logs'>
              <div className={`px-3 py-2 text-sm rounded cursor-pointer transition-colors ${
                currentPath === '/logs' 
                  ? 'text-white bg-indigo-500' 
                  : 'text-slate-600 hover:bg-indigo-50'
              }`}>
                Logs
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}