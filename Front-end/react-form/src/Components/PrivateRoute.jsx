import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStudent,setIsStudent]=useState(false);
  const[isSupervisor,setIsSupervisor]=useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost/PFE/Back-end/CheckSession.php', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Server response:', data); 
          setIsAuth(data.status === 'success');
          setIsAdmin(data.role === 'admin');
          setIsStudent(data.role === 'user');
          setIsSupervisor(data.role === 'supervisor');
        
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
  if (isStudent && adminOnly) {
    return <Navigate to="/Home" replace />;
  }
  if (adminOnly && isSupervisor ) {
    return <Navigate to="/supervisorHome" replace />;
  }
  if (!adminOnly && isAdmin) {
    return <Navigate to="/Admin" replace />;
  }
  

  return isAuth  ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;