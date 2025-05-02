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
function SupervisorSideBar() {
  return (
    <aside className="w-52 bg-gray-900 text-gray-100 flex-shrink-0">
    <nav className="py-2">
      <ul>
        <li>
          <a 
            href="#"
            onClick={(e) => { e.preventDefault(); navigateTo('/supervisor-deposerSujets'); }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 border-l-4 border-transparent hover:border-blue-500"
          >
            <Home size={18} />
            <span>Dashboard </span>
          </a>
          <a 
            href="#"
            onClick={(e) => { e.preventDefault(); navigateTo('/supervisor-deposerSujets'); }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 border-l-4 border-transparent hover:border-blue-500"
          >
            <Home size={18} />
            <span>Déposer des sujets </span>
          </a>
        </li>
        <li>
          <a 
            href="#"
            onClick={(e) => { e.preventDefault(); navigateTo('/supervisor-profile'); }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 border-l-4 border-transparent hover:border-blue-500"
          >
            <User size={18} />
            <span>Profile</span>
          </a>
        </li>
        <li>
          <a 
            href="#"
            onClick={(e) => { e.preventDefault(); navigateTo('/supervisor-students'); }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 border-l-4 border-transparent hover:border-blue-500"
          >
            <Users size={18} />
            <span>Students</span>
          </a>
        </li>
        <li>
          <a 
            href="#"
            onClick={(e) => { e.preventDefault(); navigateTo('/supervisor-projects'); }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 border-l-4 border-transparent hover:border-blue-500"
          >
            <FileText size={18} />
            <span>Projects</span>
          </a>
        </li>
        <li>
          <a 
            href="#"
            onClick={(e) => { e.preventDefault(); navigateTo('/supervisor-schedule'); }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 border-l-4 border-transparent hover:border-blue-500"
          >
            <Calendar size={18} />
            <span>Schedule</span>
          </a>
        </li>
        <li>
          <a 
            href="#"
            onClick={(e) => { e.preventDefault(); navigateTo('/supervisor-settings'); }}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 border-l-4 border-transparent hover:border-blue-500"
          >
            <Settings size={18} />
            <span>Settings</span>
          </a>
        </li>
      </ul>
    </nav>
  </aside>
  )
}

export default SupervisorSideBar