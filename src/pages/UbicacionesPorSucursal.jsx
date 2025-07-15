// UbicacionesPorSucursal.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UbicacionesPorSucursal.css';

const BASE_URL = 'https://exhibicionback-production.up.railway.app';

const UbicacionesPorSucursal = () => {
    const [sucursales, setSucursales] = useState([]);
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
    const [tipo, setTipo] = useState('G');
    const [numeroSeleccionado, setNumeroSeleccionado] = useState(null);
    const [divisionSeleccionada, setDivisionSeleccionada] = useState(null);
    const [permitidas, setPermitidas] = useState([]);
    const [productosPorUbicacion, setProductosPorUbicacion] = useState({});
    const [cargandoUbicacion, setCargandoUbicacion] = useState(null);
    const [ubicacionesVisibles, setUbicacionesVisibles] = useState(new Set());
    const navigate = useNavigate();

    const planogramaSrc = sucursalSeleccionada ? `/planogramas/${sucursalSeleccionada.id}.png` : null;

    useEffect(() => {
        fetch(`${BASE_URL}/sucursales`)
            .then(res => res.json())
            .then(data => setSucursales(data))
            .catch(err => console.error('❌ Error al cargar sucursales:', err));
    }, []);

    useEffect(() => {
        if (sucursalSeleccionada) {
            fetch(`${BASE_URL}/ubicaciones/permitidas?sucursalId=${sucursalSeleccionada.id}`)
                .then(res => res.json())
                .then(data => setPermitidas(data))
                .catch(err => console.error('❌ Error al cargar permitidas:', err));
        } else {
            setPermitidas([]);
        }
    }, [sucursalSeleccionada]);

    const numeros = [...new Set(
        permitidas.filter(u => u.tipo === tipo).map(u => u.numeroUbicacion)
    )];

    const divisiones = permitidas.filter(u =>
        u.tipo === 'G' &&
        u.numeroUbicacion === numeroSeleccionado
    );

    const divisionesUnicas = [...new Set(
        divisiones.map(u => `${u.division}${u.numeroDivision}`)
    )].filter(Boolean);

    const subdivisiones = permitidas.filter(u =>
        u.tipo === tipo &&
        u.numeroUbicacion === numeroSeleccionado &&
        (tipo !== 'G' || `${u.division}${u.numeroDivision}` === divisionSeleccionada)
    );

    const obtenerSurtido = async (nsuc, sku) => {
        try {
            const res = await fetch(`https://saas.inthegrasoftware.com/ords/inth1060/fsa/surtidos?pnsuc=${nsuc}&psku=${sku}`);
            const data = await res.json();
            return data.items?.[0]?.surtido ?? '-';
        } catch {
            return '-';
        }
    };

    const toggleUbicacion = async (ubicacion) => {
        const nueva = new Set(ubicacionesVisibles);
        if (nueva.has(ubicacion)) {
            nueva.delete(ubicacion);
        } else {
            nueva.add(ubicacion);
            if (!productosPorUbicacion[ubicacion]) {
                setCargandoUbicacion(ubicacion);
                try {
                    const res = await fetch(`${BASE_URL}/ubicaciones?ubicacion=${ubicacion}&sucursal=${sucursalSeleccionada.id}`);
                    let data = await res.json();
                    // Obtener surtido para cada producto (en paralelo)
                    data = await Promise.all(data.map(async (p) => ({
                        ...p,
                        surtido: await obtenerSurtido(sucursalSeleccionada.id, p.codplex)
                    })));

                    setProductosPorUbicacion(prev => ({ ...prev, [ubicacion]: data }));

                } catch (err) {
                    console.error('❌ Error al obtener productos:', err);
                }
                setCargandoUbicacion(null);
            }
        }
        setUbicacionesVisibles(nueva);
    };

    return (
        <div className="ubicaciones-container">
            <button
                onClick={() => navigate('/producto-por-sucursal')}
                className="boton boton-flotante-compras"
            >
                🔎 Buscar un producto
            </button>
            <h1>Productos cargados por ubicación</h1>

            <div className="form-grid">
                <div>
                    <label>Sucursal</label>
                    <select
                        onChange={(e) => {
                            const selected = sucursales.find(s => s.id === parseInt(e.target.value));
                            setSucursalSeleccionada(selected);
                            setNumeroSeleccionado(null);
                            setDivisionSeleccionada(null);
                            setProductosPorUbicacion({});
                            setUbicacionesVisibles(new Set());
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
                        setNumeroSeleccionado(null);
                        setDivisionSeleccionada(null);
                        setUbicacionesVisibles(new Set());
                        setProductosPorUbicacion({});
                    }}>
                        <option value="G">Góndola</option>
                        <option value="M">Módulo</option>
                    </select>
                </div>
            </div>

            {planogramaSrc && (
                <img
                    id="planograma-img"
                    src={planogramaSrc}
                    alt="Planograma"
                    onClick={() => {
                        const img = document.getElementById('planograma-img');
                        if (document.fullscreenElement) {
                            document.exitFullscreen();
                        } else {
                            img.requestFullscreen?.() || img.webkitRequestFullscreen?.() || img.msRequestFullscreen?.();
                        }
                    }}
                    style={{
                        width: '200px',
                        height: 'auto',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        cursor: 'pointer',
                        marginTop: '1rem'
                    }}
                />
            )}

            {sucursalSeleccionada && (
                <div className="selector-numeros">
                    <h3>Seleccioná número de {tipo === 'G' ? 'góndola' : 'módulo'}:</h3>
                    {numeros.map(n => (
                        <button
                            key={n}
                            className={`numero-btn ${numeroSeleccionado === n ? 'activo' : ''}`}
                            onClick={() => {
                                setNumeroSeleccionado(n);
                                setDivisionSeleccionada(null);
                            }}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            )}

            {sucursalSeleccionada && numeroSeleccionado && tipo === 'G' && (
                <div className="selector-numeros">
                    <h3>Seleccioná lado o puntera:</h3>
                    {divisionesUnicas.map((d, i) => (
                        <button
                            key={i}
                            className={`numero-btn ${divisionSeleccionada === d ? 'activo' : ''}`}
                            onClick={() => setDivisionSeleccionada(d)}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            )}

            {(tipo === 'M' || (tipo === 'G' && divisionSeleccionada)) && numeroSeleccionado && (
                <div className="lista-ubicaciones">
                    <h2>{tipo}{numeroSeleccionado}{divisionSeleccionada ? ` – ${divisionSeleccionada}` : ''} – Subdivisiones</h2>
                    {subdivisiones.map((u, i) => {
                        const nombreUbicacion = `${tipo}${u.numeroUbicacion}${u.division || ''}${u.numeroDivision || ''}${u.subdivision}${u.numeroSubdivision}`;
                        const productos = productosPorUbicacion[nombreUbicacion] || [];
                        const visible = ubicacionesVisibles.has(nombreUbicacion);

                        return (
                            <div key={i} className="ubicacion">
                                <h3 onClick={() => toggleUbicacion(nombreUbicacion)} className="clickable">
                                    {nombreUbicacion} {visible ? '▼' : '▶'}
                                </h3>
                                {cargandoUbicacion === nombreUbicacion && <p>Cargando productos...</p>}
                                {visible && productos.length > 0 && (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Código</th>
                                                <th>Lugar disponible</th>
                                                <th>Stock</th>
                                                <th>Surtido</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productos.map((p, j) => (
                                                <tr key={j}>
                                                    <td>{p.producto?.nombre || ''}</td>
                                                    <td>{p.codebar}</td>
                                                    <td>{p.cantidad}</td>
                                                    <td>{p.stock_actual ?? '-'}</td>
                                                    <td>{p.surtido ?? '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                                {visible && productos.length === 0 && cargandoUbicacion !== nombreUbicacion && (
                                    <p>No hay productos cargados en esta ubicación.</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UbicacionesPorSucursal;
