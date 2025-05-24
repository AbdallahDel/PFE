import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  const [loginInput, setloginInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const API_BASE_URL = 'http://localhost/PFE/Back-end';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loginInput || !password) {
      setError('Both fields are required.');
      return;
    }

    const formData = new FormData();
    formData.append('loginInput', loginInput);
    formData.append('Password', password);

    try {
      const response = await fetch(`${API_BASE_URL}/backEnd.php`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setError('');
        switch (data.role) {
          case 'student':
            navigate('/Home');
            break;
          case 'admin':
            navigate('/Admin');
            break;
          case 'supervisor':
            navigate('/supervisorHome');
            break;
          default:
            setError('Invalid role received');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('There was an error with the request: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 relative">
                <img 
                  src={"https://www.univ-alger.dz/wp-content/uploads/2023/01/cropped-logo-univ1.png"}
                  alt="University Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">University of Algiers 1</h1>
                <p className="text-sm text-gray-600">Faculty of Science - Student Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className="px-4 py-1.5 text-gray-600 hover:text-gray-800 text-sm font-medium border border-gray-300 rounded-md hover:border-gray-400 transition-all duration-200"
              >
                About
              </button>
              <div className="text-right text-xs text-gray-500 hidden sm:block">
                <p>Academic Year 2024-2025</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-800">Project Information</h3>
              <button 
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-gray-600 text-xl transition-colors duration-200"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
                <span className="font-medium text-gray-800 block text-sm">Developed by:</span>
                <p className="text-gray-700 text-sm">Abdallah delhoum</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-green-500">
                <span className="font-medium text-gray-800 block text-sm">Supervised by:</span>
                <p className="text-gray-700 text-sm">Ms. Nadira Ben Medakhene</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-purple-500">
                <span className="font-medium text-gray-800 block text-sm">Institution:</span>
                <p className="text-gray-700 text-sm">Faculty of Science - Department of Computer Science</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-orange-500">
                <span className="font-medium text-gray-800 block text-sm">Project:</span>
                <p className="text-gray-700 text-sm">PFE Management System - Final Cycle Project</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex items-center justify-center px-6 py-12 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
              <h2 className="text-xl font-semibold text-white text-center">Student Login</h2>
              <p className="text-gray-300 text-center text-sm mt-1">Enter your credentials to continue</p>
            </div>

            <div className="px-6 py-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label htmlFor="matricule" className="block text-sm font-medium text-gray-700 mb-2">
                    Matricule
                  </label>
                  <input
                    type="text"
                    id="matricule"
                    value={loginInput}
                    onChange={(e) => setloginInput(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Enter your matricule"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="remember" className="ml-3 text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 space-y-1">
            <p className="text-gray-600 text-sm font-medium">Université d'Alger 1 - Benyoucef Benkhedda</p>
            <p className="text-xs text-gray-500">© 2025 All Rights Reserved | Academic Management System</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginForm;
