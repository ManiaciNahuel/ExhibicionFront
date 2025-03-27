// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const sucursalId = localStorage.getItem('sucursalId');
  return sucursalId ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
