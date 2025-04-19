import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import SideBar from './SideBar';
import Header from './Header';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('internal');  // Default to internal tab

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost/PFE/Back-end/getProjects.php', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Filter projects based on type and search term
  const filteredProjects = projects.filter(project => 
    project.type === activeTab &&
    (project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     project.supervisorName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <SideBar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Projects</h1>
            
            {/* Sub Tabs */}
            <div className="flex space-x-4 mb-6">
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'internal'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setActiveTab('internal')}
              >
                Internal Projects
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'external'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setActiveTab('external')}
              >
                External Projects
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex items-center mb-6">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supervisor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <tr key={project.projectID}>
                      <td className="px-6 py-4 whitespace-nowrap">{project.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{project.supervisorName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{project.teamName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProjects.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No {activeTab} projects found
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Projects;