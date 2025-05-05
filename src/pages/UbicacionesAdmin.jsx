// src/pages/UbicacionesAdmin.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/UbicacionesAdmin.css';

const BASE_URL = 'https://exhibicionback-production.up.railway.app';

const UbicacionesAdmin = () => {
    const [estructura, setEstructura] = useState({
        idSucursal: '',
        sucursal: '',
        tipo: 'G'
    });

    const [divisionesForm, setDivisionesForm] = useState({
        desde: 1,
        hasta: 1,
        lados: 0,
        estantesPorLado: 0,
        punteras: 0,
        estantesPorPuntera: 0,
        estantesModulo: 0
    });

    const [sucursales, setSucursales] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [resumen, setResumen] = useState([]);
    const [ubicacionesPermitidas, setUbicacionesPermitidas] = useState([]);
    const [resumenEstructura, setResumenEstructura] = useState([]);

    useEffect(() => {
        axios.get(`${BASE_URL}/sucursales`)
            .then(res => setSucursales(res.data))
            .catch(err => console.error('Error al cargar sucursales', err));
    }, []);

    useEffect(() => {
        if (estructura.idSucursal) {
            axios.get(`${BASE_URL}/ubicaciones/permitidas`, {
                params: { sucursalId: estructura.idSucursal }
            })
                .then(res => {
                    const data = res.data.map(u => ({
                        tipo: u.tipo,
                        numeroUbicacion: Number(u.numeroUbicacion),
                        subdivision: u.subdivision,
                        numeroSubdivision: Number(u.numeroSubdivision),
                        division: u.division,
                        numeroDivision: u.numeroDivision !== null ? Number(u.numeroDivision) : null,
                        codigo: `${u.tipo}${u.numeroUbicacion}${u.division || ''}${u.numeroDivision || ''}${u.subdivision || ''}${u.numeroSubdivision || ''}`,
                    }));
                    setUbicacionesPermitidas(data);
                })
                .catch(err => console.error('Error al cargar ubicaciones permitidas', err));
        } else {
            setUbicacionesPermitidas([]);
        }
    }, [estructura.idSucursal]);

    const handleEstructuraChange = (e) => {
        setEstructura({ ...estructura, [e.target.name]: e.target.value });
    };

    const handleDivisionesChange = (e) => {
        setDivisionesForm({ ...divisionesForm, [e.target.name]: e.target.value });
    };

    const calcularResumen = () => {
        const nuevoResumen = [];
        const desde = parseInt(divisionesForm.desde);
        const hasta = parseInt(divisionesForm.hasta);
        for (let i = desde; i <= hasta; i++) {
            if (estructura.tipo === 'G') {
                for (let d = 1; d <= divisionesForm.lados; d++) {
                    nuevoResumen.push(`G${i} - Lado ${d} (${divisionesForm.estantesPorLado} estantes)`);
                }
                for (let d = 1; d <= divisionesForm.punteras; d++) {
                    nuevoResumen.push(`G${i} - Puntera ${d} (${divisionesForm.estantesPorPuntera} estantes)`);
                }
            } else {
                nuevoResumen.push(`M${i} (${divisionesForm.estantesModulo} estantes)`);
            }
        }
        setResumen(nuevoResumen);
    };

    const handleAsignarDivisiones = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            await axios.post(`${BASE_URL}/ubicaciones/permitidas/divisiones`, {
                idSucursal: estructura.idSucursal,
                sucursal: estructura.sucursal,
                tipo: estructura.tipo,
                ...divisionesForm
            });
            alert('Ubicaciones creadas correctamente');
        } catch (err) {
            console.error('Error al asignar divisiones:', err);
            alert('Error al crear ubicaciones');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        const resumenAgrupado = {};
        for (const u of ubicacionesPermitidas.filter(u => u.tipo === estructura.tipo)) {
            const clave = `${u.tipo}${u.numeroUbicacion}`;
            if (!resumenAgrupado[clave]) resumenAgrupado[clave] = [];
            resumenAgrupado[clave].push(u);
        }

        const resumenFinal = Object.entries(resumenAgrupado).map(([clave, grupo]) => {
            if (estructura.tipo === 'G') {
                const lados = grupo.filter(u => u.division === 'L');
                const punteras = grupo.filter(u => u.division === 'P');

                const contar = (arr) => {
                    const mapa = {};
                    for (const item of arr) {
                        const n = item.numeroDivision;
                        if (!mapa[n]) mapa[n] = 0;
                        mapa[n]++;
                    }
                    const partes = Object.entries(mapa).map(([num, count]) => `${count} est. en ${arr[0]?.division === 'L' ? 'Lado' : 'Punt.'} ${num}`);
                    return partes.join(', ');
                };

                return `${clave} → ${lados.length ? contar(lados) : ''} ${punteras.length ? `| ${contar(punteras)}` : ''}`;
            } else {
                const cantidad = grupo.length;
                return `${clave} → ${cantidad} estantes`;
            }
        });

        setResumenEstructura(resumenFinal);
    }, [estructura.tipo, ubicacionesPermitidas]);

    return (
        <div className="ubicaciones-admin">
            <h2>📍 Crear ubicaciones permitidas</h2>
            <form onSubmit={handleAsignarDivisiones} className="formulario">
                <div className="form-grid">
                    <div>
                        <label>Sucursal</label>
                        <select
                            name="idSucursal"
                            value={estructura.idSucursal}
                            onChange={(e) => {
                                const selected = sucursales.find(s => s.id === parseInt(e.target.value));
                                setEstructura({
                                    ...estructura,
                                    idSucursal: selected.id,
                                    sucursal: selected.nombre
                                });
                            }}
                            required
                        >
                            <option value="">Seleccionar...</option>
                            {sucursales.map(s => (
                                <option key={s.id} value={s.id}>{s.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Tipo de ubicación</label>
                        <select name="tipo" value={estructura.tipo} onChange={handleEstructuraChange}>
                            <option value="G">Góndola</option>
                            <option value="M">Módulo</option>
                        </select>
                    </div>

                    <div>
                        <label>Desde número</label>
                        <input type="number" name="desde" value={divisionesForm.desde} onChange={handleDivisionesChange} min={1} required />
                    </div>

                    <div>
                        <label>Hasta número</label>
                        <input type="number" name="hasta" value={divisionesForm.hasta} onChange={handleDivisionesChange} min={1} required />
                    </div>

                    {estructura.tipo === 'G' ? (
                        <>
                            <div>
                                <label>Cantidad de lados</label>
                                <input type="number" name="lados" value={divisionesForm.lados} onChange={handleDivisionesChange} min={0} />
                            </div>
                            <div>
                                <label>Estantes por lado</label>
                                <input type="number" name="estantesPorLado" value={divisionesForm.estantesPorLado} onChange={handleDivisionesChange} min={0} />
                            </div>
                            <div>
                                <label>Cantidad de punteras</label>
                                <input type="number" name="punteras" value={divisionesForm.punteras} onChange={handleDivisionesChange} min={0} />
                            </div>
                            <div>
                                <label>Estantes por puntera</label>
                                <input type="number" name="estantesPorPuntera" value={divisionesForm.estantesPorPuntera} onChange={handleDivisionesChange} min={0} />
                            </div>
                        </>
                    ) : (
                        <div>
                            <label>Estantes por módulo</label>
                            <input type="number" name="estantesModulo" value={divisionesForm.estantesModulo} onChange={handleDivisionesChange} min={0} />
                        </div>
                    )}
                </div>

                <div className="acciones">
                    <button type="button" className="btn-verde" onClick={calcularResumen}>📊 Ver resumen</button>
                    <button type="submit" className="btn-azul" disabled={cargando}>
                        {cargando ? '⏳ Asignando...' : '📥 Crear ubicaciones'}
                    </button>
                </div>
            </form>

            {resumen.length > 0 && (
                <div className="resumen-preview">
                    <h3>🧾 Ubicaciones a crear:</h3>
                    <ul>
                        {resumen.map((linea, i) => (
                            <li key={i}>{linea}</li>
                        ))}
                    </ul>
                </div>
            )}

            {resumenEstructura.length > 0 && (
                <div className="resumen-preview">
                    <h3>📌 Estructura existente en esta sucursal:</h3>
                    <ul>
                        {resumenEstructura.map((linea, i) => (
                            <li key={i}>{linea}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UbicacionesAdmin;
