// UbicacionesPorSucursal.jsx
import React, { useEffect, useState } from 'react';
import '../styles/UbicacionesPorSucursal.css';

const BASE_URL = 'https://exhibicionback-production.up.railway.app';

const UbicacionesPorSucursal = () => {
    const [sucursales, setSucursales] = useState([]);
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
    const [tipo, setTipo] = useState('G');
    const [numeroSeleccionado, setNumeroSeleccionado] = useState(null);
    const [permitidas, setPermitidas] = useState([]);
    const [productosPorUbicacion, setProductosPorUbicacion] = useState({});
    const [cargandoUbicacion, setCargandoUbicacion] = useState(null);
    const [ubicacionesVisibles, setUbicacionesVisibles] = useState(new Set());

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

    const subdivisiones = permitidas.filter(u =>
        u.tipo === tipo && u.numeroUbicacion === numeroSeleccionado
    );

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
                    const data = await res.json();
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
            <h1>Productos cargados por ubicación</h1>

            <div className="form-grid">
                <div>
                    <label>Sucursal</label>
                    <select
                        onChange={(e) => {
                            const selected = sucursales.find(s => s.id === parseInt(e.target.value));
                            setSucursalSeleccionada(selected);
                            setNumeroSeleccionado(null);
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
                        setUbicacionesVisibles(new Set());
                        setProductosPorUbicacion({});
                    }}>
                        <option value="G">Góndola</option>
                        <option value="M">Módulo</option>
                    </select>
                </div>
            </div>

            {sucursalSeleccionada && (
                <div className="selector-numeros">
                    <h3>Seleccioná número de {tipo === 'G' ? 'góndola' : 'módulo'}:</h3>
                    {numeros.map(n => (
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
                <div className="lista-ubicaciones">
                    <h2>{tipo}{numeroSeleccionado} – Subdivisiones</h2>
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
                                                <th>Cantidad</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productos.map((p, j) => (
                                                <tr key={j}>
                                                    <td>{p.producto?.nombre || ''}</td>
                                                    <td>{p.codebar}</td>
                                                    <td>{p.cantidad}</td>
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
