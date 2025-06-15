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
            <Link to='/AdminProfile'>
              <div className={`px-3 py-2 text-sm rounded cursor-pointer transition-colors ${
                currentPath === '/AdminProfile' 
                  ? 'text-white bg-gray-700' 
                  : 'text-slate-600 hover:bg-gray-50'
              }`}>
                Profile
              </div>
            </Link>
            <Link to='/manageUsers'>
              <div className={`px-3 py-2 text-sm rounded cursor-pointer transition-colors ${
                currentPath === '/manageUsers' 
                  ? 'text-white bg-gray-700' 
                  : 'text-slate-600 hover:bg-gray-50'
              }`}>
                Manage users
              </div>
            </Link>
            
            <Link to='/manageStudent'>
              <div className={`px-3 py-2 text-sm rounded cursor-pointer transition-colors ${
                currentPath === '/manageStudent' 
                  ? 'text-white bg-gray-700' 
                  : 'text-slate-600 hover:bg-gray-50'
              }`}>
                Manage student
              </div>
            </Link>
            
            <Link to='/manageSupervisor'>
              <div className={`px-3 py-2 text-sm rounded cursor-pointer transition-colors ${
                currentPath === '/manageSupervisor' 
                  ? 'text-white bg-gray-700' 
                  : 'text-slate-600 hover:bg-gray-50'
              }`}>
                manage supervisors
              </div>
            </Link>
            
            <Link to='/sujets'>
              <div className={`px-3 py-2 text-sm rounded cursor-pointer transition-colors ${
                currentPath === '/sujets' 
                  ? 'text-white bg-gray-700' 
                  : 'text-slate-600 hover:bg-gray-50'
              }`}>
                Sujets
              </div>
            </Link>
            
          </div>
        </div>
      </div>
    </div>
  )
}