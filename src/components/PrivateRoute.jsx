import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user')); // Check if user is in localStorage

  return user ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
