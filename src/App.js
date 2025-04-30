import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import HomeSucursal from './pages/HomeSucursal';
import DashboardSucursal from './pages/DashboardSucursal';
import VerUbicaciones from './pages/VerUbicaciones';
import BuscarProducto from './components/BuscarProducto';
import UbicacionesAdmin from './pages/UbicacionesAdmin';

const PrivateRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const App = () => {
  const [usuario, setUsuario] = useState(null);
  const rol = localStorage.getItem('rol');

  useEffect(() => {
    const nombre = localStorage.getItem('nombre');
    const sucursalId = localStorage.getItem('sucursalId');
    const sucursal = localStorage.getItem('nombreSucursal');
    const rol = localStorage.getItem('rol');

    if (nombre && sucursalId) {
      setUsuario({ nombre, sucursalId, sucursal, rol });
    }
  }, []);

  const handleLoginSuccess = () => {
    const nombre = localStorage.getItem('nombre');
    const sucursalId = localStorage.getItem('sucursalId');
    const sucursal = localStorage.getItem('nombreSucursal');
    const rol = localStorage.getItem('rol');

    setUsuario({ nombre, sucursalId, sucursal, rol });
  };


  return (
    <Router>
      <Routes>
        {usuario?.rol === 'admin' ? (
          <>
            <Route
              path="/"
              element={<Navigate to="/admin/ubicaciones" />}
            />
            <Route
              path="/admin/ubicaciones"
              element={<PrivateRoute isAuthenticated={!!usuario} element={<UbicacionesAdmin />} />}
            />
          </>
        ) : (
          <>
            <Route
              path="/"
              element={<PrivateRoute isAuthenticated={!!usuario} element={<DashboardSucursal usuario={usuario} />} />}
            />
            <Route
              path="/carga"
              element={<PrivateRoute isAuthenticated={!!usuario} element={<HomeSucursal usuario={usuario} />} />}
            />
            <Route
              path="/buscar-producto"
              element={<PrivateRoute isAuthenticated={!!usuario} element={<BuscarProducto usuario={usuario} />} />}
            />
          </>
        )}

        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

    </Router>
  );
};

export default App;
