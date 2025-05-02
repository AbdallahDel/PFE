
import React from 'react';
import LoginForm from './Components/LoginForm';
import {BrowserRouter as Router ,Routes,Route} from 'react-router-dom'
import Home from './Components/Home';
import SignUp from './Components/SignUp';
import PrivateRoute from './Components/PrivateRoute';
import Profile from './Components/Profile';
import Dashboard from './Components/Admin space/Dashboard';
import ManageUsers from './Components/Admin space/ManageUsers';
import ManageStudent from './Components/Admin space/ManageStudent';
import SupervisorHeader from './Components/Supervisor space/SupervisorHome';
import ManageSupervisor from './Components/Admin space/ManageEncadrants';
import ManageSujets from './Components/Admin space/ManageSujets';


document.documentElement.classList.add('dark')
function App() {
  return (
    <div className="font-sans">
    <Router>
      <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/SignUp" element={<SignUp/>} />
      
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
        <PrivateRoute adminOnly ={true}>
        <ManageUsers />
        </PrivateRoute>
        } />

        
      <Route path="/manageStudent"  element={
        <PrivateRoute adminOnly ={true}>
        <ManageStudent />
        </PrivateRoute>
        } />

      <Route path="/manageSupervisor"  element={
        <PrivateRoute adminOnly ={true}>
        <ManageSupervisor/>
        </PrivateRoute>
        } />

      <Route path="/sujets"  element={
        <PrivateRoute adminOnly ={true}>
        <ManageSujets/>
        </PrivateRoute>
        } />
      
      </Routes>

  </Router>
  </div>

  );}
   
       

export default App;
