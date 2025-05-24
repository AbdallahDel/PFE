import React from 'react';
import LoginForm from './Components/LoginForm';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/student space/Home';
import SignUp from './Components/SignUp';
import PrivateRoute from './Components/PrivateRoute';
import Profile from './Components/student space/Profile';
import Dashboard from './Components/Admin space/Dashboard';
import ManageUsers from './Components/Admin space/ManageUsers';
import ManageStudent from './Components/Admin space/ManageStudent';
import SupervisorHeader from './Components/Supervisor space/SupervisorHome';
import ManageSupervisor from './Components/Admin space/ManageEncadrants';
import ManageSujets from './Components/Admin space/ManageSujets';
import SupervisorProfile from './Components/Supervisor space/SupervisorProfile';
import DeposerSujet from './Components/Supervisor space/DeposerSujet';
import SujetsSupervisor from './Components/Supervisor space/SujetsSupervisor';
import NotFoundPage from '../src/NotFoundPage';
import ConsulterThemes from './Components/student space/ConsulterThemes';
import Settings from './Components/Supervisor space/Settings';
import SupervisorChoices from './Components/Supervisor space/SupervisorChoices';
import MesChoix from './Components/student space/MesChoix';
import MonTheme from './Components/student space/MonTheme';
import MyProjects from './Components/Supervisor space/MyProjects';
import ProposerSujetExtern from './Components/student space/ProposerSujetExtern';
import AdminProfile from './Components/Admin space/Profile';

document.documentElement.classList.add('dark');

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/SignUp" element={<SignUp />} />
        
        {/* Student routes */}
        <Route path="/Home" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/Profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/ConsulterThemes" element={
          <PrivateRoute>
            <ConsulterThemes />
          </PrivateRoute>
        } />
        <Route path="/Mychoix" element={
          <PrivateRoute>
            <MesChoix />
          </PrivateRoute>
        } />
        <Route path="/MonTheme" element={
          <PrivateRoute>
            <MonTheme/>
          </PrivateRoute>
        } />
        <Route path="/ProposerSujetExtern" element={
          <PrivateRoute>
            <ProposerSujetExtern/>
          </PrivateRoute>
        } />
        
        {/* Admin routes */}
        <Route path="/Admin" element={
          <PrivateRoute adminOnly={true}>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/ManageUsers" element={
          <PrivateRoute adminOnly={true}>
            <ManageUsers />
          </PrivateRoute>
        } />
        <Route path="/ManageStudent" element={
          <PrivateRoute adminOnly={true}>
            <ManageStudent />
          </PrivateRoute>
        } />
        <Route path="/ManageSupervisor" element={
          <PrivateRoute adminOnly={true}>
            <ManageSupervisor />
          </PrivateRoute>
        } />
        <Route path="/Sujets" element={
          <PrivateRoute adminOnly={true}>
            <ManageSujets />
          </PrivateRoute>
        } />
        <Route path="/AdminProfile" element={
          <PrivateRoute adminOnly={true}>
            <AdminProfile />
          </PrivateRoute>
        } />
        
        {/* Supervisor routes */}
        <Route path="/SupervisorHome" element={
          <PrivateRoute supervisorOnly={true}>
            <SupervisorHeader />
          </PrivateRoute>
        } />
        <Route path="/Supervisor-Profile" element={
          <PrivateRoute supervisorOnly={true}>
            <SupervisorProfile />
          </PrivateRoute>
        } />
        <Route path="/SujetsSupervisor" element={
          <PrivateRoute supervisorOnly={true}>
            <DeposerSujet />
          </PrivateRoute>
        } />
        <Route path="/deposerSujet" element={
          <PrivateRoute supervisorOnly={true}>
            <SujetsSupervisor />
          </PrivateRoute>
        } />

        <Route path="/Settings" element={
          <PrivateRoute supervisorOnly={true}>
            <Settings/>
          </PrivateRoute>
        } />
        <Route path="/MesChoix" element={
          <PrivateRoute supervisorOnly={true}>
            <SupervisorChoices/>
          </PrivateRoute>
        } />

        <Route path="/MyProjects" element={
          <PrivateRoute supervisorOnly={true}>
            <MyProjects/>
          </PrivateRoute>
        } />
        
        {/* 404 Not Found - This must be the last route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
    
  );
}

export default App;