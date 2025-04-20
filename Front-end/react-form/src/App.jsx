import React from 'react';
import LoginForm from './Components/LoginForm';
import {BrowserRouter as Router ,Routes,Route} from 'react-router-dom'
import Home from './Components/Home';
import PrivateRoute from './Components/PrivateRoute';
import Profile from './Components/Profile';
import Dashboard from './Components/Admin space/Dashboard';
import ManageUsers from './Components/Admin space/ManageUsers';
import ManageSupervisor from './Components/Admin space/ManageSupervisor';
import SupervisorHeader from './Components/Supervisor space/SupervisorHome';
import Projects from './Components/Admin space/Projects';

document.documentElement.classList.add('dark')
function App() {
  return (
    <div className="font-sans">
    <Router>
      <Routes>
      <Route path="/" element={<LoginForm />} />
      
      <Route
      path="/home"
      element={
      <PrivateRoute adminOnly={false}  >
      <Home />
    </PrivateRoute>
                }
      />
      <Route
      path="/supervisorHome"
      element={
      <PrivateRoute adminOnly={false}>
      <SupervisorHeader />
      </PrivateRoute>
    
                }
      />

      <Route
      path="/profile"
      element={
      <PrivateRoute adminOnly={false}>
      <Profile />
    </PrivateRoute>
                }
      />

      <Route path="/Admin" element={
        <PrivateRoute adminOnly={true} >
        <Dashboard />
        </PrivateRoute>
        } 
      />

      <Route path="/manageUsers"  element={
        <PrivateRoute adminOnly={true}>
        <ManageUsers />
        </PrivateRoute>
        } />

      <Route path="/projects"  element={
        <PrivateRoute adminOnly={true}>
        <Projects />
        </PrivateRoute>
        } />
        
      <Route path="/manageSupervisor"  element={
        <PrivateRoute adminOnly={true}>
        <ManageSupervisor />
        </PrivateRoute>
        } />
      
      </Routes>

    </Router>
    </div>
  );
}
   
export default App;
