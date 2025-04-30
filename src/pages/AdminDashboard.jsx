// src/pages/AdminDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="ubicaciones-admin">
            <h2>🛠 Panel de Administrador</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                <button onClick={() => navigate('/admin/ubicaciones')} className="btn-verde">
                    ➕ Cargar ubicaciones permitidas
                </button>
                <button onClick={() => navigate('/admin/ver-ubicaciones')} className="btn-azul">
                    🔍 Ver ubicaciones por sucursal
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
