import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductoEnUbicacion from '../components/ProductoEnUbicacion';
import ModalEditarCantidad from '../components/ModalEditarCantidad';
import ModalProductoEnOtraUbicacion from '../components/ModalProductoEnOtraUbicacion';

const HomeSucursal = () => {
    const [codigoUbicacion, setCodigoUbicacion] = useState('');
    const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);
    const [codigoBarras, setCodigoBarras] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [productosCargados, setProductosCargados] = useState([]);
    const [loading, setLoading] = useState(false);

    const [productoExistente, setProductoExistente] = useState(null);
    const [mostrarModalCantidad, setMostrarModalCantidad] = useState(false);

    const [productoDuplicado, setProductoDuplicado] = useState(null);
    const [ubicacionAnterior, setUbicacionAnterior] = useState('');
    const [mostrarModalDuplicado, setMostrarModalDuplicado] = useState(false);

    const [enProceso, setEnProceso] = useState(new Set());

    const sucursalId = localStorage.getItem('sucursalId');

    const handleConfirmarUbicacion = (e) => {
        e.preventDefault();
        if (!codigoUbicacion.trim()) return;
        setUbicacionConfirmada(true);
    };

    const handleDescargarTxt = () => {
        if (productosCargados.length === 0) return;
        const contenido = productosCargados.map(p => `${p.codigo};`).join('\n');
        const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SA${sucursalId}_Ubic-${codigoUbicacion}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleAgregarProducto = async (e) => {
        e.preventDefault();
        if (!codigoUbicacion || !codigoBarras || cantidad < 1) return;

        if (enProceso.has(codigoBarras)) {
            alert("⏳ Ya estás cargando este producto. Esperá un momento.");
            return;
        }

        const existente = productosCargados.find(p => p.codigo === codigoBarras);
        if (existente) {
            setProductoExistente(existente);
            setMostrarModalCantidad(true);
            return;
        }

        setEnProceso(prev => new Set(prev).add(codigoBarras));

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

            const resCheck = await axios.get(`http://localhost:3000/ubicaciones/check`, {
                params: {
                    codebar: codigoBarras,
                    sucursalId
                }
            });

            const yaEnOtraUbicacion = resCheck.data.find(p => p.ubicacion !== codigoUbicacion);

            if (yaEnOtraUbicacion) {
                setProductoDuplicado({
                    ...producto,
                    codebar: codigoBarras,
                    cantidad,
                    tipo: tipoUbicacion,
                    numero,
                    subdivision: sub
                });
                setUbicacionAnterior(yaEnOtraUbicacion.ubicacion);
                setMostrarModalDuplicado(true);
                return;
            }

            await crearProducto(producto, codigoBarras, cantidad, tipoUbicacion, numero, sub);
        } catch (err) {
            console.error("❌ Error al asignar producto:", err);
        } finally {
            setEnProceso(prev => {
                const nuevo = new Set(prev);
                nuevo.delete(codigoBarras);
                return nuevo;
            });
        }
    };

    const crearProducto = async (producto, codigo, cantidad, tipo, numero, subdivision) => {
        try {
            const res = await axios.post(`http://localhost:3000/ubicaciones`, {
                codebar: codigo,
                tipo,
                numero,
                subdivision,
                cantidad,
                sucursalId: parseInt(sucursalId)
            });

            const nuevo = res.data;

            setProductosCargados(prev => [
                ...prev,
                {
                    id: nuevo.id,
                    nombre: producto.nombre || producto.Producto || 'Sin nombre',
                    codigo,
                    cantidad,
                    ubicacion: codigoUbicacion
                }
            ]);

            setCodigoBarras('');
            setCantidad(1);
        } catch (error) {
            alert("Error al agregar producto");
        }
    };

    const handleConfirmarDuplicado = async (opcion) => {
        if (!productoDuplicado) return;

        const { codebar, cantidad, tipo, numero, subdivision } = productoDuplicado;

        if (opcion === 'mover') {
            try {
                // Eliminar anterior
                const resCheck = await axios.get(`http://localhost:3000/ubicaciones/check`, {
                    params: {
                        codebar,
                        sucursalId
                    }
                });

                const existente = resCheck.data.find(p => p.ubicacion !== codigoUbicacion);
                if (existente?.id) {
                    await axios.delete(`http://localhost:3000/ubicaciones/${existente.id}`);
                }
            } catch (err) {
                console.error("❌ Error al eliminar ubicación anterior:", err);
            }
        }

        await crearProducto(productoDuplicado, codebar, cantidad, tipo, numero, subdivision);
        setMostrarModalDuplicado(false);
        setProductoDuplicado(null);
    };

    const handleGuardarDesdeModal = async (id, nuevaCantidad) => {
        try {
            await axios.put(`http://localhost:3000/ubicaciones/${id}`, {
                cantidad: parseInt(nuevaCantidad),
                sucursalId: parseInt(sucursalId)
            });

            setMostrarModalCantidad(false);
            setProductoExistente(null);
            setProductosCargados(prev =>
                prev.map(p => p.id === id ? { ...p, cantidad: nuevaCantidad } : p)
            );
        } catch (err) {
            console.error("❌ Error al actualizar cantidad desde modal:", err);
        }
    };

    const handleNuevaUbicacion = () => {
        setCodigoUbicacion('');
        setUbicacionConfirmada(false);
        setProductosCargados([]);
    };

    const handleEliminarProducto = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/ubicaciones/${id}`);
            setProductosCargados(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error("❌ Error al eliminar producto", err);
            alert("Error al eliminar el producto.");
        }
    };

    const handleActualizarCantidad = (id, nuevaCantidad) => {
        setProductosCargados(prev =>
            prev.map(p => p.id === id ? { ...p, cantidad: nuevaCantidad } : p)
        );
    };

    const handleReubicarProducto = (id) => {
        setProductosCargados(prev => prev.filter(p => p.id !== id));
    };

    useEffect(() => {
        const fetchProductosEnUbicacion = async () => {
            if (ubicacionConfirmada && codigoUbicacion && sucursalId) {
                setLoading(true);
                try {
                    const res = await axios.get(`http://localhost:3000/ubicaciones?sucursal=${sucursalId}&ubicacion=${codigoUbicacion}`);
                    if (Array.isArray(res.data)) {
                        const productos = res.data.map(p => ({
                            id: p.id,
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
                    </div>

                    <button onClick={handleDescargarTxt} style={{ marginTop: '1rem' }}>
                        📥 Descargar TXT con códigos
                    </button>

                    <form onSubmit={handleAgregarProducto} style={{ marginTop: '1.5rem' }}>
                        <label>➕ Agregar otro producto:</label><br />
                        <input
                            type="text"
                            value={codigoBarras}
                            onChange={(e) => setCodigoBarras(e.target.value)}
                            placeholder="Código de barras"
                            required
                        />
                        <input
                            type="number"
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                            min="1"
                            required
                        />
                        <button
                            type="submit"
                            disabled={
                                !codigoBarras.trim() ||
                                parseInt(cantidad) < 1 ||
                                enProceso.has(codigoBarras)
                            }
                        >
                            ➕ Agregar
                        </button>

                        {enProceso.has(codigoBarras) && (
                            <div style={{ color: 'red', marginTop: '0.5rem' }}>
                                🔴 El código seleccionado se está agregando
                            </div>
                        )}
                    </form>

                    {loading && <div style={{ marginTop: '0.5rem' }}>⏳ Cargando productos...</div>}

                    {!loading && productosCargados.length > 0 && (
                        <ul>
                            {productosCargados.map((p) => (
                                <ProductoEnUbicacion
                                    key={p.id}
                                    producto={p}
                                    onActualizar={handleActualizarCantidad}
                                    onEliminar={handleEliminarProducto}
                                    onReubicar={handleReubicarProducto}
                                />
                            ))}
                        </ul>
                    )}

                    {!loading && productosCargados.length === 0 && (
                        <div style={{ backgroundColor: '#d1ecf1', padding: '10px', marginTop: '1rem', border: '1px solid #bee5eb' }}>
                            ℹ️ No hay productos cargados en esta ubicación todavía.
                        </div>
                    )}

                    {mostrarModalCantidad && productoExistente && (
                        <ModalEditarCantidad
                            producto={productoExistente}
                            onClose={() => setMostrarModalCantidad(false)}
                            onGuardar={handleGuardarDesdeModal}
                        />
                    )}

                    {mostrarModalDuplicado && productoDuplicado && (
                        <ModalProductoEnOtraUbicacion
                            producto={productoDuplicado}
                            ubicacionAnterior={ubicacionAnterior}
                            onConfirmar={handleConfirmarDuplicado}
                            onClose={() => {
                                setMostrarModalDuplicado(false);
                                setProductoDuplicado(null);
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default HomeSucursal;
