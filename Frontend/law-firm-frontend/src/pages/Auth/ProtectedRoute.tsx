// src/components/Auth/ProtectedRoute.tsx

import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';

export const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const { 
    isAuthenticated, 
    isLoading, 
    requiresFirmCreation, 
    requiresFirmSelection,
    initializeAuth 
  } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await initializeAuth();
      setIsChecking(false);
    };
    checkAuth();
  }, [initializeAuth]);

  // Show loading while checking authentication
  if (isChecking || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Needs firm creation
  if (requiresFirmCreation) {
    return <Navigate to="/create-firm" replace />;
  }

  // Needs firm selection (user has multiple firms)
  if (requiresFirmSelection) {
    return <Navigate to="/select-firm" replace />;
  }

  // Authenticated, render child routes
  return <Outlet />;
};