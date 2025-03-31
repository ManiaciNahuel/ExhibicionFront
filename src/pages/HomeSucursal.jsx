import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductoEnUbicacion from '../components/ProductoEnUbicacion';
import ModalEditarCantidad from '../components/ModalEditarCantidad';
import ModalProductoEnOtraUbicacion from '../components/ModalProductoEnOtraUbicacion';
import '../styles/HomeSucursal.css';


const HomeSucursal = () => {
    const [tipoSeleccionado, setTipoSeleccionado] = useState('');
    const [numeroSeleccionado, setNumeroSeleccionado] = useState('');
    const [subdivisionSeleccionada, setSubdivisionSeleccionada] = useState('');
    const [codigoUbicacion, setCodigoUbicacion] = useState('');
    const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);

    const [codigoBarras, setCodigoBarras] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [productosCargados, setProductosCargados] = useState([]);
    const [ubicacionesPermitidas, setUbicacionesPermitidas] = useState([]);

    const [loading, setLoading] = useState(false);
    const [productoExistente, setProductoExistente] = useState(null);
    const [mostrarModalCantidad, setMostrarModalCantidad] = useState(false);
    const [productoDuplicado, setProductoDuplicado] = useState(null);
    const [ubicacionAnterior, setUbicacionAnterior] = useState('');
    const [mostrarModalDuplicado, setMostrarModalDuplicado] = useState(false);
    const [enProceso, setEnProceso] = useState(new Set());

    const sucursalId = localStorage.getItem('sucursalId');

    useEffect(() => {
        const fetchUbicacionesPermitidas = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/ubicaciones/permitidas?sucursalId=${sucursalId}`);
                const data = res.data.map(u => ({
                    tipo: u.tipo,
                    numeroUbicacion: u.numeroUbicacion,
                    subdivision: u.subdivision,
                    numeroSubdivision: u.numeroSubdivision,
                    categoria: u.categoria || 'Sin categoría',
                    codigo: `${u.tipo}${u.numeroUbicacion}${u.subdivision || ''}${u.numeroSubdivision || ''}`,

                }));

                setUbicacionesPermitidas(data);

            } catch (err) {
                console.error("❌ Error al obtener ubicaciones permitidas", err);
            }
        };

        fetchUbicacionesPermitidas();
    }, [sucursalId]);

    const tipos = [...new Set(ubicacionesPermitidas.map(u => u.tipo))];
    const numeros = [...new Set(
        ubicacionesPermitidas
            .filter(u => u.tipo === tipoSeleccionado)
            .map(u => u.numeroUbicacion)
    )];
    const subdivisiones = [...new Set(
        ubicacionesPermitidas
            .filter(u => u.tipo === tipoSeleccionado && u.numeroUbicacion === Number(numeroSeleccionado))
            .map(u => `${u.subdivision || ''}${u.numeroSubdivision || ''}`)
    )];



    const handleConfirmarUbicacion = (e) => {
        e.preventDefault();
        const codigo = `${tipoSeleccionado}${numeroSeleccionado}${subdivisionSeleccionada}`;
        setCodigoUbicacion(codigo);
        setUbicacionConfirmada(true);
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

            // Descomponer ubicación correctamente
            const tipoUbicacion = codigoUbicacion.match(/^[A-Z]+/)[0];
            const resto = codigoUbicacion.replace(tipoUbicacion, '');

            const numero = parseInt(resto.match(/^\d+/)[0]); // Número de ubicación
            const subConNum = resto.replace(numero, ''); // Ej: "E2"
            const letraSubdivision = subConNum[0]; // "E"
            const numeroSubdivision = parseInt(subConNum.slice(1)); // 2

            const resCheck = await axios.get(`http://localhost:3000/ubicaciones/check`, {
                params: { codebar: codigoBarras, sucursalId }
            });

            const yaEnOtraUbicacion = resCheck.data.find(p => p.ubicacion !== codigoUbicacion);

            if (yaEnOtraUbicacion) {
                setProductoDuplicado({
                    ...producto,
                    codebar: codigoBarras,
                    cantidad,
                    tipo: tipoUbicacion,
                    numero,
                    subdivision: letraSubdivision,
                    numeroSubdivision
                });
                setUbicacionAnterior(yaEnOtraUbicacion.ubicacion);
                setMostrarModalDuplicado(true);
                return;
            }

            // Si no está duplicado, lo agregamos
            await crearProducto(producto, codigoBarras, cantidad, tipoUbicacion, numero, letraSubdivision, numeroSubdivision);

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


    const crearProducto = async (producto, codigo, cantidad, tipo, numero, subdivision, numeroSubdivision) => {
        try {
            const res = await axios.post(`http://localhost:3000/ubicaciones`, {
                codebar: codigo,
                tipo,
                numero,
                subdivision,
                numeroSubdivision,
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
                    ubicacion: `${tipo}${numero}${subdivision || ''}${numeroSubdivision || ''}`
                }
            ]);
    
            setCodigoBarras('');
            setCantidad(1);
        } catch (error) {
            console.error("❌ Error al crear producto:", error);
            alert("Error al agregar producto");
        }
    };
    


    const handleActualizarCantidad = (id, nuevaCantidad) => {
        setProductosCargados(prev =>
            prev.map(p => p.id === id ? { ...p, cantidad: nuevaCantidad } : p)
        );
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

    const handleReubicarProducto = (id) => {
        setProductosCargados(prev => prev.filter(p => p.id !== id));
    };

    const handleGuardarDesdeModal = async (id, nuevaCantidad) => {
        try {
            await axios.put(`http://localhost:3000/ubicaciones/${id}`, {
                cantidad: parseInt(nuevaCantidad),
                sucursalId: parseInt(sucursalId)
            });

            setMostrarModalCantidad(false);
            setProductoExistente(null);
            handleActualizarCantidad(id, nuevaCantidad);
        } catch (err) {
            console.error("❌ Error al actualizar cantidad desde modal:", err);
        }
    };

    const handleConfirmarDuplicado = async (opcion) => {
        if (!productoDuplicado) return;

        const { codebar, cantidad, tipo, numero, subdivision } = productoDuplicado;

        if (opcion === 'mover') {
            try {
                const resCheck = await axios.get(`http://localhost:3000/ubicaciones/check`, {
                    params: { codebar, sucursalId }
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


    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h2>📦 Carga de Productos por Ubicación</h2>

            {!ubicacionConfirmada ? (
                <form onSubmit={handleConfirmarUbicacion}>
                    <div className="tipo-selector">
                        <h4>Tipo de ubicación:</h4>
                        {["M", "G", "P"].map((tipo) => (
                            <button
                                key={tipo}
                                className={`tipo-btn ${tipoSeleccionado === tipo ? "activo" : ""}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setTipoSeleccionado(tipo);
                                    setNumeroSeleccionado('');
                                    setSubdivisionSeleccionada('');
                                }}
                            >
                                {tipo === "M" ? "🧱 Módulo" : tipo === "G" ? "🛒 Góndola" : "📌 Puntera"}
                            </button>
                        ))}
                    </div>

                    {tipoSeleccionado && (
                        <div className="numero-selector">
                            <h4>Número:</h4>
                            {[...new Set(numeros)].map((n) => (
                                <button
                                    key={n}
                                    className={`numero-btn ${numeroSeleccionado === n ? "activo" : ""}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setNumeroSeleccionado(n);
                                        setSubdivisionSeleccionada('');
                                    }}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    )}

                    {numeroSeleccionado && (
                        <div className="subdivision-selector">
                            <h4>Estante / Fila:</h4>
                            {[...new Set(subdivisiones)].map((s) => (
                                <button
                                    key={s}
                                    className={`subdivision-btn ${subdivisionSeleccionada === s ? "activo" : ""}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSubdivisionSeleccionada(s);
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {subdivisionSeleccionada && (
                        <button type="submit" className="btn-confirmar-ubicacion">
                            ✅ Confirmar Ubicación
                        </button>
                    )}
                </form>
            ) : (
                <div>
                    <h3>📍 Ubicación actual: <span style={{ color: 'green' }}>{codigoUbicacion}</span></h3>
                    <button onClick={() => setUbicacionConfirmada(false)} style={{ marginBottom: '1rem' }}>
                        🔄 Cambiar ubicación
                    </button>

                    <form onSubmit={handleAgregarProducto} style={{ marginBottom: '1rem' }}>
                        <label>📦 Escaneá o escribí el código del producto:</label><br />
                        <input
                            type="text"
                            value={codigoBarras}
                            onChange={(e) => setCodigoBarras(e.target.value)}
                            placeholder="Código de barras"
                            required
                            style={{ marginRight: '1rem' }}
                        />
                        <input
                            type="number"
                            value={cantidad}
                            onChange={(e) => setCantidad(parseInt(e.target.value))}
                            min="1"
                            required
                            style={{ width: '60px', marginRight: '1rem' }}
                        />
                        <button type="submit">➕ Agregar</button>
                    </form>

                    {loading && <p>⏳ Cargando productos...</p>}

                    {!loading && productosCargados.length > 0 && (
                        <ul style={{ padding: 0 }}>
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
                        <div style={{ marginTop: '1rem', backgroundColor: '#e8f0fe', padding: '1rem', borderRadius: '5px' }}>
                            ℹ️ No hay productos cargados aún en esta ubicación.
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
                </div>

            )}
        </div>
    );
};

export default HomeSucursal;
