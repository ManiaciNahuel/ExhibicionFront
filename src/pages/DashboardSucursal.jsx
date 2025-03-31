// pages/DashboardSucursal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // lo armamos luego


const DashboardSucursal = () => {
  const navigate = useNavigate();
  const nombreSucursal = localStorage.getItem('nombreSucursal') || 'Sucursal';

  return (
    <div className="dashboard-container">
      <h2>📍 Exhibición de {nombreSucursal}</h2>

      {/* Podés cambiar por imagen real */}
      <div className="planograma-placeholder">
        🗺️ Aquí podría ir el planograma de la sucursal
      </div>

      <div className="dashboard-buttons">
        <button onClick={() => navigate('/carga')}>📦 Cargar Productos</button>
        {/* <button onClick={() => navigate('/ver-ubicaciones')}>📂 Ver Ubicaciones</button> */}
        <button onClick={() => navigate('/buscar-producto')}>🔎 Buscar Producto</button>
      </div>
    </div>
  );
};

export default DashboardSucursal;
