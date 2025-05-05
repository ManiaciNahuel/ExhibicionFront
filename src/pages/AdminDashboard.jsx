// src/pages/AdminDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="ubicaciones-admin">
            <h2>🛠 Panel de Administrador</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '60px' }}>
                <button onClick={() => navigate('/admin/ubicaciones')} className="btn-verde">
                    ➕ Cargar ubicaciones permitidas
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
