import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './stores/authStore';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CreateFirm from './components/auth/CreateFirm';
import Dashboard from './components/dashboard/Dashboard';
import ContactsList from './components/contacts/ContactsList';
import ContactDetail from './components/contacts/ContactDetail';
import Toast from './components/common/Toast';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, requiresFirmCreation, requiresFirmSelection } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiresFirmCreation) {
    return <Navigate to="/create-firm" />;
  }
  
  if (requiresFirmSelection) {
    return <Navigate to="/select-firm" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Toast />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-firm" element={<CreateFirm />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="contacts" element={<ContactsList />} />
          <Route path="contacts/:id" element={<ContactDetail />} />
          <Route path="calendar" element={<div className="p-6">Calendar View Coming Soon</div>} />
          <Route path="tasks" element={<div className="p-6">Tasks View Coming Soon</div>} />
          <Route path="communications" element={<div className="p-6">Communications Coming Soon</div>} />
          <Route path="documents" element={<div className="p-6">Documents Coming Soon</div>} />
          <Route path="billing" element={<div className="p-6">Billing Coming Soon</div>} />
          <Route path="settings" element={<div className="p-6">Settings Coming Soon</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;