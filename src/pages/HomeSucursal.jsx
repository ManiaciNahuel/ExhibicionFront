import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BuscarProducto from '../components/BuscarProducto';

const HomeSucursal = () => {
    const [codigoUbicacion, setCodigoUbicacion] = useState('');
    const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);

    const [codigoBarras, setCodigoBarras] = useState('');
    const [cantidad, setCantidad] = useState(1);

    const [productosCargados, setProductosCargados] = useState([]);
    const [loading, setLoading] = useState(false);


    const handleConfirmarUbicacion = (e) => {
        e.preventDefault();
        if (!codigoUbicacion.trim()) return;
        setUbicacionConfirmada(true);
    };

    const handleDescargarTxt = () => {
        if (productosCargados.length === 0) return;

        const contenido = productosCargados
            .map(p => p.codigo) // Solo el código de barras
            .join('\n');

        const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${codigoUbicacion}.txt`; // El nombre del archivo será la ubicación
        a.click();
        URL.revokeObjectURL(url);
    };


    const handleAgregarProducto = async (e) => {
        e.preventDefault();
        if (!codigoUbicacion || !codigoBarras || cantidad < 1) return;

        try {
            const res = await axios.get(`http://localhost:3000/productos/${codigoBarras}`);
            const producto = res.data;


            if (!producto) {
                alert('Producto no encontrado');
                return;
            }

            const tipoUbicacion = codigoUbicacion.match(/^[A-Z]+/)[0];
            const resto = codigoUbicacion.replace(tipoUbicacion, '');
            const numero = parseInt(resto.match(/\d+/)[0]);
            const sub = resto.replace(numero, '') || null;
            const sucursalId = localStorage.getItem('sucursalId');
            if (!sucursalId) {
                alert("No se encontró la sucursal. Por favor, iniciá sesión nuevamente.");
                return;
            }

            await axios.post('http://localhost:3000/ubicaciones', {
                codebar: codigoBarras,
                tipo: tipoUbicacion,
                numero: numero,
                subdivision: sub,
                cantidad: parseInt(cantidad),
                sucursalId: parseInt(sucursalId)
            });


            setProductosCargados(prev => [
                ...prev,
                {
                    nombre: producto.nombre,
                    codigo: codigoBarras,
                    cantidad,
                    ubicacion: codigoUbicacion
                }
            ]);

            setCodigoBarras('');
            setCantidad(1);
        } catch (error) {
            console.error(error);
            alert("Error al asignar producto a ubicación");
        }
    };

    const handleNuevaUbicacion = () => {
        setCodigoUbicacion('');
        setUbicacionConfirmada(false);
        setProductosCargados([]);
    };

    useEffect(() => {
        const fetchProductosEnUbicacion = async () => {
            if (ubicacionConfirmada && codigoUbicacion) {
                const sucursalId = localStorage.getItem('sucursalId');
                setLoading(true);
                try {
                    const res = await axios.get(`http://localhost:3000/ubicaciones?sucursal=${sucursalId}&ubicacion=${codigoUbicacion}`);
                    if (Array.isArray(res.data)) {
                        const productos = res.data.map(p => ({
                            nombre: p.producto?.nombre || 'Sin nombre',
                            codigo: p.codebar,
                            cantidad: p.cantidad,
                            ubicacion: p.ubicacion
                        }));
                        setProductosCargados(productos);
                    }
                } catch (err) {
                    console.error("Error al consultar productos ya cargados:", err);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProductosEnUbicacion();
    }, [ubicacionConfirmada, codigoUbicacion]);


    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h2>📦 Carga de Productos por Ubicación</h2>

            {!ubicacionConfirmada ? (
                <form onSubmit={handleConfirmarUbicacion}>
                    <label>📍 Escaneá o escribí el código de la ubicación:</label>
                    <input
                        type="text"
                        value={codigoUbicacion}
                        onChange={(e) => setCodigoUbicacion(e.target.value.toUpperCase())}
                        placeholder="Ej: G1E3"
                        required
                        autoFocus
                    />
                    <button type="submit">✅ Confirmar Ubicación</button>
                </form>
            ) : (
                <>
                    <div style={{ marginBottom: '1rem' }}>
                        <h3>📍 Ubicación actual: <span style={{ color: 'green' }}>{codigoUbicacion}</span></h3>
                        <button onClick={handleNuevaUbicacion}>🔄 Cambiar ubicación</button>
                        {loading && (
                            <p style={{ color: 'gray', marginTop: '1rem' }}>🔄 Cargando productos en esta ubicación...</p>
                        )}

                        {!loading && productosCargados.length > 0 && (
                            <div style={{ backgroundColor: '#fff3cd', padding: '10px', marginTop: '1rem', border: '1px solid #ffeeba' }}>
                                ⚠️ Ya hay productos cargados en esta ubicación.
                            </div>
                        )}

                    </div>

                    <form onSubmit={handleAgregarProducto}>
                        <label>🔍 Código de barras del producto:</label>
                        <input
                            type="text"
                            value={codigoBarras}
                            onChange={(e) => setCodigoBarras(e.target.value)}
                            required
                            autoFocus
                        />
                        <br />
                        <label>🔢 Cantidad:</label>
                        <input
                            type="number"
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                            min="1"
                            required
                        />
                        <br />
                        <button type="submit">📲 Registrar Producto</button>
                    </form>

                    {productosCargados.length > 0 && (
                        <>
                            <h4 style={{ marginTop: '2rem' }}>✅ Productos cargados en {codigoUbicacion}:</h4>
                            <ul>
                                {productosCargados.map((p, i) => (
                                    <li key={i}>{p.nombre} (x{p.cantidad}) - {p.codigo}</li>
                                ))}
                            </ul>
                            <button onClick={handleDescargarTxt} style={{ marginTop: '1rem' }}>
                                📥 Descargar TXT con códigos
                            </button>
                        </>
                    )}

                </>
            )}
        </div>
    );
};

export default HomeSucursal;
