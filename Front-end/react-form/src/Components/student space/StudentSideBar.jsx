import React, { useState } from 'react';
import { User, FileText, Users, CheckSquare, Calendar, ChevronDown, ChevronRight } from 'lucide-react';

export default function StudentSidebar() {
  const [showThemesDropdown, setShowThemesDropdown] = useState(false);
  // Assume we're on ConsulterThemes page for this demo
  const currentPath = "/ConsulterThemes";
  
  // Function to navigate (would use history/navigate in a real app)
  const navigateTo = (path) => {
    console.log(`Navigating to: ${path}`);
    // In a real app with react-router-dom:
    // navigate(path) or history.push(path)
    window.location.href = path;
  };

  return (
    <div className="bg-gray-100 w-64 h-full p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-2">
          <User size={40} className="text-gray-600" />
        </div>
        <button 
          onClick={() => navigateTo("/Profile")}
          className="mt-2 bg-blue-800 text-white text-center py-2 px-4 rounded w-full hover:bg-blue-700"
        >
          Mon Profile
        </button>
      </div>

      <nav>
        <ul className="space-y-1">
          {/* Themes dropdown menu */}
          <li>
            <button 
              onClick={() => setShowThemesDropdown(!showThemesDropdown)}
              className={`flex items-center justify-between w-full p-2 rounded ${
                currentPath === "/ConsulterThemes" || currentPath === "/ProposerTheme" 
                  ? 'bg-gray-200' 
                  : 'hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center">
                <Users size={18} className="mr-2 text-blue-800" />
                <span>Consulter Les Themes</span>
              </div>
              {showThemesDropdown ? 
                <ChevronDown size={16} className="text-gray-600" /> : 
                <ChevronRight size={16} className="text-gray-600" />
              }
            </button>
            
            {showThemesDropdown && (
              <ul className="ml-6 mt-1 space-y-1">
                <li>
                  <button 
                    onClick={() => navigateTo("/ConsulterThemes")}
                    className={`flex items-center p-2 rounded text-sm w-full text-left ${
                      currentPath === "/ConsulterThemes" 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-600 mr-2"></span>
                    Thèmes Internes
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateTo("/ProposerSujetExtern")}
                    className={`flex items-center p-2 rounded text-sm w-full text-left ${
                      currentPath === "/ProposerSujetExtern" 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-600 mr-2"></span>
                    Proposer un Thème Externe
                  </button>
                </li>
              </ul>
            )}
          </li>
          
          <li>
            <button 
              onClick={() => navigateTo("/MyChoix")}
              className={`flex items-center p-2 rounded w-full text-left ${
                currentPath === "/MyChoix" 
                  ? 'bg-gray-200' 
                  : 'hover:bg-gray-200'
              }`}
            >
              <CheckSquare size={18} className="mr-2 text-pink-600" />
              Mes Choix
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateTo("/MonTheme")}
              className={`flex items-center p-2 rounded w-full text-left ${
                currentPath === "/MonTheme" 
                  ? 'bg-gray-200' 
                  : 'hover:bg-gray-200'
              }`}
            >
              <FileText size={18} className="mr-2 text-green-600" />
              Mon Theme
            </button>
          </li>
          <li>
            
          </li>
        </ul>
      </nav>
    </div>
  );
}