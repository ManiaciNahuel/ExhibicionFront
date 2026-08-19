// src/pages/PlanogramasAdmin.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/UbicacionesAdmin.css';

const BASE_URL = process.env.REACT_APP_API_URL;

const PlanogramasAdmin = () => {
    const [sucursales, setSucursales] = useState([]);
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
    const [planogramaUrl, setPlanogramaUrl] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        axios.get(`${BASE_URL}/sucursales`).then(res => setSucursales(res.data));
    }, []);

    useEffect(() => {
        setArchivo(null);
        setPreviewUrl('');
        setMensaje('');

        if (!sucursalSeleccionada) {
            setPlanogramaUrl('');
            return;
        }

        axios.get(`${BASE_URL}/planogramas/${sucursalSeleccionada.id}`)
            .then(res => setPlanogramaUrl(`${BASE_URL}${res.data.imagen}`))
            .catch(() => setPlanogramaUrl(''));
    }, [sucursalSeleccionada]);

    const handleArchivoSeleccionado = (e) => {
        const file = e.target.files[0];
        setArchivo(file);
        setMensaje('');
        setPreviewUrl(file ? URL.createObjectURL(file) : '');
    };

    const handleGuardar = async () => {
        if (!sucursalSeleccionada || !archivo) return;

        const rol = localStorage.getItem('rol');
        const formData = new FormData();
        formData.append('imagen', archivo);
        formData.append('rol', rol);

        setGuardando(true);
        setMensaje('');

        try {
            const res = await axios.post(
                `${BASE_URL}/planogramas/${sucursalSeleccionada.id}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            setPlanogramaUrl(`${BASE_URL}${res.data.imagen}?t=${Date.now()}`);
            setArchivo(null);
            setPreviewUrl('');
            setMensaje('✅ Planograma actualizado correctamente');
        } catch (err) {
            console.error('❌ Error al subir el planograma:', err);
            setMensaje('❌ Error al subir el planograma');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="ubicaciones-admin">
            <div className="lado-izquierdo">
                <h2>🖼 Gestionar planogramas</h2>

                <div className="form-grid">
                    <div>
                        <label>Sucursal</label>
                        <select
                            value={sucursalSeleccionada?.id || ''}
                            onChange={(e) => {
                                const selected = sucursales.find(s => s.id === parseInt(e.target.value));
                                setSucursalSeleccionada(selected || null);
                            }}
                        >
                            <option value="">Seleccionar...</option>
                            {sucursales.map(s => (
                                <option key={s.id} value={s.id}>{s.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {sucursalSeleccionada && (
                    <>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3>Planograma actual</h3>
                            {planogramaUrl ? (
                                <img
                                    src={planogramaUrl}
                                    alt="Planograma actual"
                                    style={{ width: '250px', borderRadius: '8px', border: '1px solid #ccc' }}
                                />
                            ) : (
                                <p>No hay planograma cargado para esta sucursal.</p>
                            )}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label>Nueva imagen</label>
                            <input type="file" accept="image/*" onChange={handleArchivoSeleccionado} />
                        </div>

                        {previewUrl && (
                            <div style={{ marginBottom: '1rem' }}>
                                <h3>Vista previa</h3>
                                <img
                                    src={previewUrl}
                                    alt="Vista previa"
                                    style={{ width: '250px', borderRadius: '8px', border: '1px solid #ccc' }}
                                />
                            </div>
                        )}

                        <div className="acciones">
                            <button
                                className="btn-verde"
                                onClick={handleGuardar}
                                disabled={!archivo || guardando}
                            >
                                {guardando ? 'Guardando...' : '✅ Guardar planograma'}
                            </button>
                        </div>

                        {mensaje && <p style={{ marginTop: '1rem' }}>{mensaje}</p>}
                    </>
                )}
            </div>
        </div>
    );
};

export default PlanogramasAdmin;
