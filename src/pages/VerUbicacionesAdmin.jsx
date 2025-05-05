// src/pages/UbicacionesAdmin.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/UbicacionesAdmin.css';

const BASE_URL = 'https://exhibicionback-production.up.railway.app';

const UbicacionesAdmin = () => {
    const [sucursales, setSucursales] = useState([]);
    const [ubicacionesPermitidas, setUbicacionesPermitidas] = useState([]);
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
    const [tipo, setTipo] = useState('G');
    const [numeroSeleccionado, setNumeroSeleccionado] = useState(null);
    const [divisiones, setDivisiones] = useState([]);
    const [seleccionadas, setSeleccionadas] = useState(new Set());

    useEffect(() => {
        axios.get(`${BASE_URL}/sucursales`).then(res => setSucursales(res.data));
    }, []);

    useEffect(() => {
        if (sucursalSeleccionada) {
            axios.get(`${BASE_URL}/ubicaciones/permitidas`, {
                params: { sucursalId: sucursalSeleccionada.id }
            }).then(res => setUbicacionesPermitidas(res.data));
        } else {
            setUbicacionesPermitidas([]);
        }
    }, [sucursalSeleccionada]);

    const numeros = [...new Set(
        ubicacionesPermitidas
            .filter(u => u.tipo === tipo)
            .map(u => u.numeroUbicacion)
    )];

    const divisionesDisponibles = (tipo === 'G' && numeroSeleccionado)
        ? ubicacionesPermitidas
            .filter(u => u.tipo === 'G' && u.numeroUbicacion === parseInt(numeroSeleccionado))
            .map(u => `${u.division}${u.numeroDivision}`)
            .filter((v, i, a) => a.indexOf(v) === i)
        : [];

    const handleSeleccion = (clave) => {
        const nueva = new Set(seleccionadas);
        if (nueva.has(clave)) {
            nueva.delete(clave);
        } else {
            nueva.add(clave);
        }
        setSeleccionadas(nueva);
    };

    const crearUbicaciones = async () => {
        const datos = Array.from(seleccionadas).map(clave => {
            const [numero, div, numDiv, sub, numSub] = clave.split('-');
            return {
                idSucursal: sucursalSeleccionada.id,
                sucursal: sucursalSeleccionada.nombre,
                tipo,
                numeroUbicacion: parseInt(numero),
                division: div || null,
                numeroDivision: numDiv ? parseInt(numDiv) : null,
                subdivision: sub,
                numeroSubdivision: parseInt(numSub)
            };
        });

        try {
            await axios.post(`${BASE_URL}/ubicaciones/permitidas/crear`, datos);
            alert('Ubicaciones creadas correctamente');
            setSeleccionadas(new Set());
        } catch (err) {
            console.error('❌ Error al crear ubicaciones', err);
            alert('Error al crear ubicaciones');
        }
    };

    return (
        <div className="ubicaciones-admin">
            <h2>📍 Crear ubicaciones visualmente</h2>
            <div className="form-grid">
                <div>
                    <label>Sucursal</label>
                    <select
                        onChange={(e) => {
                            const selected = sucursales.find(s => s.id === parseInt(e.target.value));
                            setSucursalSeleccionada(selected);
                        }}
                    >
                        <option value="">Seleccionar...</option>
                        {sucursales.map(s => (
                            <option key={s.id} value={s.id}>{s.nombre}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Tipo</label>
                    <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                        <option value="G">Góndola</option>
                        <option value="M">Módulo</option>
                    </select>
                </div>
            </div>

            {sucursalSeleccionada && (
                <div className="selector-numeros">
                    <h3>Números disponibles:</h3>
                    {[...Array(50).keys()].map(i => i + 1).map(n => (
                        <button
                            key={n}
                            className={`numero-btn ${numeroSeleccionado === n ? 'activo' : ''}`}
                            onClick={() => setNumeroSeleccionado(n)}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            )}

            {numeroSeleccionado && (
                <div className="selector-subdivisiones">
                    <h3>Elegí subdivisiones para {tipo}{numeroSeleccionado}:</h3>
                    {[...Array(10).keys()].map(subNum => (
                        ['E'].map(sub => {
                            const clave = `${numeroSeleccionado}--${sub}-${subNum + 1}`;
                            const yaExiste = ubicacionesPermitidas.some(u =>
                                u.tipo === tipo &&
                                u.numeroUbicacion === numeroSeleccionado &&
                                u.subdivision === sub &&
                                u.numeroSubdivision === subNum + 1
                            );
                            return (
                                <button
                                    key={clave}
                                    onClick={() => handleSeleccion(clave)}
                                    className={
                                        `subdivision-btn ${yaExiste ? 'existente' : ''} ${seleccionadas.has(clave) ? 'seleccionada' : ''}`
                                    }
                                >
                                    {sub}{subNum + 1}
                                </button>
                            );
                        })
                    ))}
                </div>
            )}

            {seleccionadas.size > 0 && (
                <div className="acciones">
                    <button className="btn-verde" onClick={crearUbicaciones}>
                        ✅ Crear ubicaciones seleccionadas
                    </button>
                </div>
            )}
        </div>
    );
};

export default UbicacionesAdmin;
