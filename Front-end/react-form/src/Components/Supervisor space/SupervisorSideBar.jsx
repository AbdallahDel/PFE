import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <aside className="w-52 bg-gray-900 text-gray-100 flex-shrink-0">
      <nav className="py-2">
        <ul>
          <li>
            <Link to="/supervisorHome">
              <div className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-800 border-l-4 ${
                currentPath === '/supervisorHome'
                  ? 'border-blue-500 bg-gray-800' 
                  : 'border-transparent'
              }`}>
                <Home size={18} />
                <span>Dashboard</span>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/deposerSujet">
              <div className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-800 border-l-4 ${
                currentPath === '/deposerSujet' 
                  ? 'border-blue-500 bg-gray-800' 
                  : 'border-transparent'
              }`}>
                <FileText size={18} />
                <span>Déposer des sujets</span>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/supervisor-profile">
              <div className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-800 border-l-4 ${
                currentPath === '/supervisor-profile' 
                  ? 'border-blue-500 bg-gray-800' 
                  : 'border-transparent'
              }`}>
                <User size={18} />
                <span>Profile</span>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/MesChoix">
              <div className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-800 border-l-4 ${
                currentPath === '/MesChoix' 
                  ? 'border-blue-500 bg-gray-800' 
                  : 'border-transparent'
              }`}>
                <Users size={18} />
                <span>Mes choix</span>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/MyProjects">
              <div className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-800 border-l-4 ${
                currentPath === '/MyProjects' 
                  ? 'border-blue-500 bg-gray-800' 
                  : 'border-transparent'
              }`}>
                <FileText size={18} />
                <span>My Projects</span>
              </div>
            </Link>
          </li>
          
          <li>
            <Link to="/Settings">
              <div className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-800 border-l-4 ${
                currentPath === 'Settings' 
                  ? 'border-blue-500 bg-gray-800' 
                  : 'border-transparent'
              }`}>
                <Settings size={18} />
                <span>Settings</span>
              </div>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default SupervisorSideBar;