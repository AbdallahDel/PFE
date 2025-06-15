import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, adminOnly = false, supervisorOnly = false }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:8000/CheckSession.php', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Server response:', data);
          
          setIsAuth(data.status === 'success');
          setRole(data.role);
        } else {
          console.error(`HTTP error! Status: ${response.status}`);
          setIsAuth(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner component
  }

  // Not authenticated - redirect to login
  if (!isAuth) {
    return <Navigate to="/" />;
  }

  // Route access logic based on roles
  if (adminOnly && role !== 'admin') {
    return <Navigate to="/Home" />;
  }

  if (supervisorOnly && role !== 'supervisor') {
    return <Navigate to="/Home" />;
  }

  // Student can only access student routes
  if (role === 'student' && (adminOnly || supervisorOnly)) {
    return <Navigate to="/Home" />;
  }

  // Admin can only access admin routes
  if (role === 'admin' && !adminOnly) {
    return <Navigate to="/Admin" />;
  }

  // Supervisor can only access supervisor routes
  if (role === 'supervisor' && !supervisorOnly) {
    return <Navigate to="/SupervisorHome" />;
  }

  // All checks passed, render the protected component
  return children;
};

export default PrivateRoute;