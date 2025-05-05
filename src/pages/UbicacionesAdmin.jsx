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
    const [numerosSeleccionados, setNumerosSeleccionados] = useState(new Set());
    const [divisionesSeleccionadas, setDivisionesSeleccionadas] = useState(new Set());
    const [subdivisionesSeleccionadas, setSubdivisionesSeleccionadas] = useState(new Set());

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

    const handleToggleSet = (setState, value) => {
        setState(prev => {
            const nuevo = new Set(prev);
            if (nuevo.has(value)) {
                nuevo.delete(value);
            } else {
                nuevo.add(value);
            }
            return nuevo;
        });
    };

    const crearUbicaciones = async () => {
        const datos = [];
        numerosSeleccionados.forEach(numero => {
            if (tipo === 'M') {
                subdivisionesSeleccionadas.forEach(sub => {
                    const [subdivision, numeroSubdivision] = sub.split('-');
                    datos.push({
                        idSucursal: sucursalSeleccionada.id,
                        sucursal: sucursalSeleccionada.nombre,
                        tipo,
                        numeroUbicacion: parseInt(numero),
                        division: null,
                        numeroDivision: null,
                        subdivision,
                        numeroSubdivision: parseInt(numeroSubdivision)
                    });
                });
            } else {
                divisionesSeleccionadas.forEach(div => {
                    const [division, numeroDivision] = div.split('-');
                    subdivisionesSeleccionadas.forEach(sub => {
                        const [subdivision, numeroSubdivision] = sub.split('-');
                        datos.push({
                            idSucursal: sucursalSeleccionada.id,
                            sucursal: sucursalSeleccionada.nombre,
                            tipo,
                            numeroUbicacion: parseInt(numero),
                            division,
                            numeroDivision: parseInt(numeroDivision),
                            subdivision,
                            numeroSubdivision: parseInt(numeroSubdivision)
                        });
                    });
                });
            }
        });

        try {
            await axios.post(`${BASE_URL}/ubicaciones/permitidas/crear`, datos);
            alert('Ubicaciones creadas correctamente');
            setNumerosSeleccionados(new Set());
            setDivisionesSeleccionadas(new Set());
            setSubdivisionesSeleccionadas(new Set());
            const res = await axios.get(`${BASE_URL}/ubicaciones/permitidas`, {
                params: { sucursalId: sucursalSeleccionada.id }
            });
            setUbicacionesPermitidas(res.data);
        } catch (err) {
            console.error('❌ Error al crear ubicaciones', err);
            alert('Error al crear ubicaciones');
        }
    };

    const ubicacionesAgrupadas = () => {
        if (!sucursalSeleccionada) return null;

        const agrupadas = {};
        for (const u of ubicacionesPermitidas) {
            if (tipo && u.tipo !== tipo) continue;
            if (numerosSeleccionados.size > 0 && !numerosSeleccionados.has(String(u.numeroUbicacion))) continue;
            if (tipo === 'G' && divisionesSeleccionadas.size > 0 && u.division && !divisionesSeleccionadas.has(`${u.division}-${u.numeroDivision}`)) continue;
            if (subdivisionesSeleccionadas.size > 0 && u.subdivision && u.numeroSubdivision && !subdivisionesSeleccionadas.has(`${u.subdivision}-${u.numeroSubdivision}`)) continue;

            const clave = `${u.tipo}-${u.numeroUbicacion}`;
            if (!agrupadas[clave]) agrupadas[clave] = {};
            const keyDivision = tipo === 'G' ? `${u.division}-${u.numeroDivision}` : 'M';
            if (!agrupadas[clave][keyDivision]) agrupadas[clave][keyDivision] = [];
            agrupadas[clave][keyDivision].push(u.numeroSubdivision);
        }

        return (
            <div className="lado-derecho">
                <div className="resumen-seleccion">
                    <h4>🔍 Resumen de selección:</h4>
                    <p><strong>Tipo:</strong> {tipo === 'G' ? 'Góndola' : 'Módulo'}</p>
                    <p><strong>Números seleccionados:</strong> {[...numerosSeleccionados].join(', ')}</p>
                    {tipo === 'G' && <p><strong>Divisiones seleccionadas:</strong> {[...divisionesSeleccionadas].map(d => d.replace('-', ' ')).join(', ')}</p>}
                    <p><strong>Estantes seleccionados:</strong> {[...subdivisionesSeleccionadas].map(s => s.replace('-', '')).join(', ')}</p>
                </div>

                <div className="existentes-listado">
                    <h3>📋 Ubicaciones ya creadas (filtradas)</h3>
                    {Object.entries(agrupadas).map(([clave, divisiones]) => {
                        const [tipo, numero] = clave.split('-');
                        return (
                            <div key={clave} className="existente-item">
                                <strong>{tipo === 'G' ? 'Góndola' : 'Módulo'} {numero}:</strong>
                                <ul>
                                    {Object.entries(divisiones).map(([divKey, estantes], i) => {
                                        const label = tipo === 'G'
                                            ? `${divKey.startsWith('P') ? 'Puntera' : 'Lado'} ${divKey.split('-')[1]}`
                                            : 'Estantes';
                                        const ests = [...new Set(estantes)].sort((a, b) => a - b).join(', ');
                                        return <li key={i}>{label}: Estantes {ests}</li>;
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="ubicaciones-admin">
            <div className="lado-izquierdo">
                <h2>📍 Crear ubicaciones visualmente</h2>
                <div className="form-grid">
                    <div>
                        <label>Sucursal</label>
                        <select
                            onChange={(e) => {
                                const selected = sucursales.find(s => s.id === parseInt(e.target.value));
                                setSucursalSeleccionada(selected);
                                setNumerosSeleccionados(new Set());
                                setDivisionesSeleccionadas(new Set());
                                setSubdivisionesSeleccionadas(new Set());
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
                        <select value={tipo} onChange={(e) => {
                            setTipo(e.target.value);
                            setNumerosSeleccionados(new Set());
                            setDivisionesSeleccionadas(new Set());
                            setSubdivisionesSeleccionadas(new Set());
                        }}>
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
                                className={`numero-btn ${numerosSeleccionados.has(String(n)) ? 'activo' : ''}`}
                                onClick={() => handleToggleSet(setNumerosSeleccionados, String(n))}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                )}

                {tipo === 'G' && numerosSeleccionados.size > 0 && (
                    <div className="selector-divisiones">
                        <h3>Divisiones disponibles:</h3>
                        {['L', 'P'].flatMap(d => [1, 2, 3, 4, 5, 6].map(num => `${d}-${num}`)).map(dkey => (
                            <button
                                key={dkey}
                                className={`division-btn ${divisionesSeleccionadas.has(dkey) ? 'activo' : ''}`}
                                onClick={() => handleToggleSet(setDivisionesSeleccionadas, dkey)}
                            >
                                {dkey.startsWith('L') ? `Lado ${dkey.split('-')[1]}` : `Puntera ${dkey.split('-')[1]}`}
                            </button>
                        ))}
                    </div>
                )}

                {((tipo === 'M' && numerosSeleccionados.size > 0) || (tipo === 'G' && divisionesSeleccionadas.size > 0)) && (
                    <div className="selector-subdivisiones">
                        <h3>Estantes / filas:</h3>
                        {[...Array(10).keys()].map(i => `E-${i + 1}`).map(skey => (
                            <button
                                key={skey}
                                className={`subdivision-btn ${subdivisionesSeleccionadas.has(skey) ? 'activo' : ''}`}
                                onClick={() => handleToggleSet(setSubdivisionesSeleccionadas, skey)}
                            >
                                {skey.replace('-', '')}
                            </button>
                        ))}
                    </div>
                )}

                {subdivisionesSeleccionadas.size > 0 && (
                    <div className="acciones">
                        <button className="btn-verde" onClick={crearUbicaciones}>
                            ✅ Crear ubicaciones seleccionadas
                        </button>
                    </div>
                )}
            </div>

            {ubicacionesAgrupadas()}
        </div>
    );
};

export default UbicacionesAdmin;
