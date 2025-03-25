import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import HomeSucursal from './pages/HomeSucursal';

const App = () => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Si hay datos en localStorage, los usamos
    const nombre = localStorage.getItem('nombre');
    const sucursalId = localStorage.getItem('sucursalId');
    if (nombre && sucursalId) {
      setUsuario({ nombre, sucursalId });
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={usuario ? <HomeSucursal /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login onLoginSuccess={setUsuario} />} />
      </Routes>
    </Router>
  );
};

export default App;
