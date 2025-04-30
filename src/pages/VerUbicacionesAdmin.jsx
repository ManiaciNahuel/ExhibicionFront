// src/pages/VerUbicacionesAdmin.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = 'https://exhibicionback-production.up.railway.app';

const VerUbicacionesAdmin = () => {
    const [sucursales, setSucursales] = useState([]);
    const [sucursalId, setSucursalId] = useState('');
    const [ubicaciones, setUbicaciones] = useState([]);

    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroNumero, setFiltroNumero] = useState('');

    useEffect(() => {
        axios.get(`${BASE_URL}/sucursales`)
            .then(res => setSucursales(res.data))
            .catch(err => console.error('Error al cargar sucursales', err));
    }, []);

    const handleBuscar = async () => {
        if (!sucursalId) return;
        try {
            const res = await axios.get(`${BASE_URL}/ubicaciones/permitidas`, {
                params: { sucursalId }
            });
            setUbicaciones(res.data);
        } catch (err) {
            console.error('❌ Error al obtener ubicaciones:', err);
        }
    };

    const ubicacionesFiltradas = ubicaciones.filter(u => {
        return (
            (filtroTipo === '' || u.tipo === filtroTipo) &&
            (filtroNumero === '' || u.numeroUbicacion === parseInt(filtroNumero))
        );
    });

    return (
        <div className="ubicaciones-admin">
            <h2>🔎 Ver ubicaciones permitidas por sucursal</h2>

            <div className="formulario">
                <label>Seleccionar sucursal</label>
                <select
                    className="w-full border p-2 mb-4"
                    value={sucursalId}
                    onChange={e => setSucursalId(e.target.value)}
                >
                    <option value="">Seleccionar...</option>
                    {sucursales.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                </select>
                <button onClick={handleBuscar} className="btn-azul mb-6">Buscar ubicaciones</button>

                {ubicaciones.length > 0 && (
                    <div className="form-grid mb-6">
                        <div>
                            <label>Filtrar por tipo</label>
                            <select className="w-full border p-2" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                                <option value="">Todos</option>
                                <option value="G">Góndola</option>
                                <option value="M">Módulo</option>
                            </select>
                        </div>
                        <div>
                            <label>Filtrar por número</label>
                            <input
                                className="w-full border p-2"
                                type="number"
                                value={filtroNumero}
                                onChange={e => setFiltroNumero(e.target.value)}
                                placeholder="Ej: 1, 2..."
                            />
                        </div>
                    </div>
                )}

            </div>

            {ubicacionesFiltradas.length > 0 && (
                <div className="grupo-ubicaciones">
                    {Object.entries(
                        ubicacionesFiltradas.reduce((acc, u) => {
                            const clave = `${u.tipo}${u.numeroUbicacion}`;
                            acc[clave] = acc[clave] || [];
                            acc[clave].push(u);
                            return acc;
                        }, {})
                    ).map(([clave, grupo], index) => (
                        <div key={index} className="grupo">
                            <h4 className="grupo-titulo">📦 {grupo[0].tipo} {grupo[0].numeroUbicacion}</h4>
                            <ul className="grupo-lista">
                                {grupo.map((u, i) => (
                                    <li key={i} className="grupo-item">
                                        <strong>{u.subdivision}{u.numeroSubdivision}</strong>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VerUbicacionesAdmin;
