import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import HomeSucursal from './pages/HomeSucursal';
import DashboardSucursal from './pages/DashboardSucursal';
import VerUbicaciones from './pages/VerUbicaciones';
import BuscarProducto from './components/BuscarProducto';

const PrivateRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const App = () => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const nombre = localStorage.getItem('nombre');
    const sucursalId = localStorage.getItem('sucursalId');
    const sucursal = localStorage.getItem('nombreSucursal');

    if (nombre && sucursalId) {
      setUsuario({ nombre, sucursalId, sucursal });
    }
  }, []);

  const handleLoginSuccess = () => {
    const nombre = localStorage.getItem('nombre');
    const sucursalId = localStorage.getItem('sucursalId');
    const sucursal = localStorage.getItem('nombreSucursal');

    setUsuario({ nombre, sucursalId, sucursal });
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute
              isAuthenticated={!!usuario}
              element={<DashboardSucursal usuario={usuario} />}
            />
          }
        />
        <Route
          path="/carga"
          element={
            <PrivateRoute
              isAuthenticated={!!usuario}
              element={<HomeSucursal usuario={usuario} />}
            />
            
          }

        />
        <Route
          path="/buscar-producto"
          element={
            <PrivateRoute
              isAuthenticated={!!usuario}
              element={<BuscarProducto usuario={usuario} />}
            />
          }
        />
        {/* <Route
          path="/ver-ubicaciones"
          element={
            <PrivateRoute
              isAuthenticated={!!usuario}
              element={<VerUbicaciones usuario={usuario} />}
            />
          }
        /> */}


        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
