import React, { useState, useEffect } from 'react';
import axios from 'axios';
import planogramaSA3 from '../assets/planogramas/sucursal3.png';
import '../styles/HomeSucursal.css';
import CargaProductos from '../components/CargaProductos';
import SelectorUbicacion from '../components/SelectorUbicacion';
import { useNavigate } from 'react-router-dom';


const HomeSucursal = () => {
    const [tipoSeleccionado, setTipoSeleccionado] = useState('');
    const [numeroSeleccionado, setNumeroSeleccionado] = useState('');
    const [subdivisionSeleccionada, setSubdivisionSeleccionada] = useState('');
    const [codigoUbicacion, setCodigoUbicacion] = useState('');
    const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);
    const [productosCargando, setProductosCargando] = useState(new Set());
    const [errorProducto, setErrorProducto] = useState('');

    const [codigoBarras, setCodigoBarras] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [productosCargados, setProductosCargados] = useState([]);
    const [ubicacionesPermitidas, setUbicacionesPermitidas] = useState([]);
    const [division, setDivision] = useState('');
    const [numeroDivision, setNumeroDivision] = useState('');

    const [loading, setLoading] = useState(false);
    const [productoExistente, setProductoExistente] = useState(null);
    const [mostrarModalCantidad, setMostrarModalCantidad] = useState(false);
    const [productoDuplicado, setProductoDuplicado] = useState(null);
    const [ubicacionAnterior, setUbicacionAnterior] = useState('');
    const [mostrarModalDuplicado, setMostrarModalDuplicado] = useState(false);
    const [enProceso, setEnProceso] = useState(new Set());

    const sucursalId = localStorage.getItem('sucursalId');

    const navigate = useNavigate();


    useEffect(() => {
        if (ubicacionConfirmada && codigoUbicacion) {
            fetchProductosEnUbicacion();
        }
    }, [ubicacionConfirmada, codigoUbicacion]);

    const fetchProductosEnUbicacion = async () => {
        console.log("🔍 Fetching productos para:", { sucursalId, codigoUbicacion });
        try {
            const res = await axios.get(`https://exhibicionback-production.up.railway.app/ubicaciones`, {
                params: {
                    sucursal: sucursalId,
                    ubicacion: codigoUbicacion
                }
            });
            console.log("📦 Productos recibidos:", res.data);
            setProductosCargados(res.data);
        } catch (error) {
            console.error("❌ Error al traer productos:", error);
        }
    };

    useEffect(() => {
        const fetchUbicacionesPermitidas = async () => {
            try {
                const res = await axios.get(`https://exhibicionback-production.up.railway.app/ubicaciones/permitidas?sucursalId=${sucursalId}`);
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



    const handleConfirmarUbicacion = async (e) => {
        e.preventDefault();
        const codigo = `${tipoSeleccionado}${numeroSeleccionado}${tipoSeleccionado === 'G' ? division + numeroDivision : ''}${subdivisionSeleccionada}`;

        setCodigoUbicacion(codigo);
        setUbicacionConfirmada(true);
        setLoading(true); // ⏳ Empezamos a cargar

        try {
            const res = await axios.get(`https://exhibicionback-production.up.railway.app/ubicaciones`, {
                params: {
                    sucursal: sucursalId,
                    ubicacion: codigo
                }
            });

            const productos = res.data.map(p => ({
                id: p.id,
                nombre: `${p.producto?.Producto || ''} ${p.producto?.Presentaci || ''}`.trim() || 'Sin nombre',
                codigo: p.codebar,
                codplex: p.codplex,
                cantidad: p.cantidad,
                ubicacion: codigo
            }));

            setProductosCargados(productos);
        } catch (error) {
            console.error("❌ Error al traer productos:", error);
            alert("No se pudieron cargar los productos para esta ubicación.");
        } finally {
            setLoading(false); // ✅ Finalizamos la carga
        }
    };

    const normalizarCodigo = (code) => code.replace(/^0+/, '');

    const handleAgregarProducto = async (e) => {
        e.preventDefault();
        // 🔧 Normalizar código si empieza con 0 y tiene 11 dígitos

        if (!codigoUbicacion || !codigoBarras || cantidad < 1) return;

        if (enProceso.has(codigoBarras)) {
            alert("⏳ Ya estás cargando este producto. Esperá un momento.");
            return;
        }

        setEnProceso(prev => new Set(prev).add(codigoBarras));

        try {
            setProductosCargando(prev => new Set(prev).add(codigoBarras));

            const res = await axios.get(`https://exhibicionback-production.up.railway.app/productos/${codigoBarras}`);
            const producto = res.data;
            if (!producto || !producto.CodPlex) {
                setErrorProducto('Producto no encontrado');
                return;
            }

            // ✅ Verificación local en la ubicación actual por codplex
            const yaEnUbicacionActual = productosCargados.find(
                (p) => String(p.codplex) === String(producto.CodPlex)
            );
            console.log("🔎 Codplex comparación:", {
                cargados: productosCargados.map(p => p.codplex),
                producto: producto.CodPlex,
            });

            console.log("🔍 Verificando si ya existe en la ubicación actual:", { yaEnUbicacionActual, producto });
            if (yaEnUbicacionActual) {
                setProductoExistente(yaEnUbicacionActual);
                setMostrarModalCantidad(true);
                return;
            }

            // 🧠 Descomponer ubicación correctamente
            const tipoUbicacion = codigoUbicacion.match(/^[A-Z]+/)[0];
            let resto = codigoUbicacion.replace(tipoUbicacion, '');

            const numero = parseInt(resto.match(/^\d+/)[0]);
            resto = resto.replace(numero, '');

            let letraDivision = null;
            let numeroDivision = null;

            // Solo si es góndola ('G'), tomar división
            if (tipoUbicacion === 'G') {
                letraDivision = resto[0];
                resto = resto.slice(1);
                const numDiv = parseInt(resto.match(/^\d+/)?.[0]);
                if (!Number.isNaN(numDiv)) {
                    numeroDivision = numDiv;
                    resto = resto.replace(numDiv, '');
                }
            }

            const letraSubdivision = resto[0] || null;
            const numSub = parseInt(resto.slice(1));
            const numeroSubdivision = Number.isNaN(numSub) ? null : numSub;

            const resCheck = await axios.get(`https://exhibicionback-production.up.railway.app/ubicaciones/check`, {
                params: { codplex: producto.CodPlex, sucursalId }
            });

            const yaEnOtraUbicacion = resCheck.data.find(p => p.ubicacion !== codigoUbicacion);

            if (yaEnOtraUbicacion) {
                setProductoDuplicado({
                    ...producto,
                    codebar: codigoBarras,
                    codplex: producto.CodPlex,
                    cantidad,
                    tipo: tipoUbicacion,
                    numero,
                    subdivision: letraSubdivision,
                    numeroSubdivision,
                    division: letraDivision,
                    numeroDivision
                });
                setUbicacionAnterior(yaEnOtraUbicacion.ubicacion);
                setMostrarModalDuplicado(true);
                return;
            }

            // Si no está duplicado, lo agregamos
            await crearProducto(
                producto,
                codigoBarras,
                cantidad,
                tipoUbicacion,
                numero,
                letraSubdivision || null,
                numeroSubdivision,
                letraDivision || null,
                numeroDivision,
                producto.CodPlex // ✅ pasamos codplex
            );

            return true;
        } catch (err) {
            console.error("❌ Error al asignar producto:", err);
            setErrorProducto('Producto no encontrado.');
            return false;
        } finally {
            setEnProceso(prev => {
                const nuevo = new Set(prev);
                nuevo.delete(codigoBarras);
                return nuevo;
            });
            setProductosCargando(prev => {
                const nuevo = new Set(prev);
                nuevo.delete(codigoBarras);
                return nuevo;
            });
        }
    };




    const crearProducto = async (producto, codigo, cantidad, tipo, numero, subdivision, numeroSubdivision, division, numeroDivision) => {
        try {
            const res = await axios.post(`https://exhibicionback-production.up.railway.app/ubicaciones`, {
                codebar: codigo,
                codplex: producto.CodPlex,
                tipo,
                numero,
                subdivision,
                numeroSubdivision,
                division,
                numeroDivision,
                cantidad,
                sucursalId: parseInt(sucursalId)
            });

            const nuevo = res.data;

            setProductosCargados(prev => [
                ...prev,
                {
                    id: nuevo.id,
                    nombre: `${producto.Producto || ''} ${producto.Presentaci || ''}`.trim() || 'Sin nombre',
                    codigo,
                    cantidad,
                    codplex: producto.CodPlex, // 👈 clave para que funcione el find
                    ubicacion: `${tipo}${numero}${division || ''}${numeroDivision || ''}${subdivision || ''}${numeroSubdivision || ''}`

                }
            ]);
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
            await axios.delete(`https://exhibicionback-production.up.railway.app/ubicaciones/${id}`);
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
            await axios.put(`https://exhibicionback-production.up.railway.app/ubicaciones/${id}`, {
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

        const {
            codebar,
            cantidad,
            tipo,
            numero,
            subdivision,
            numeroSubdivision,
            division,
            numeroDivision
        } = productoDuplicado;

        if (opcion === 'mover') {
            try {
                const resCheck = await axios.get(`https://exhibicionback-production.up.railway.app/ubicaciones/check`, {
                    params: { codebar, sucursalId }
                });

                const existente = resCheck.data.find(p => p.ubicacion !== codigoUbicacion);
                if (existente?.id) {
                    await axios.delete(`https://exhibicionback-production.up.railway.app/ubicaciones/${existente.id}`);
                }
            } catch (err) {
                console.error("❌ Error al eliminar ubicación anterior:", err);
            }
        }

        await crearProducto(
            productoDuplicado,
            codebar,
            cantidad,
            tipo,
            numero,
            subdivision || null,
            numeroSubdivision,
            division || null,
            numeroDivision
        );

        setMostrarModalDuplicado(false);
        setProductoDuplicado(null);
    };


    return (
        <>
            <div style={{ display: 'flex', gap: '2rem', padding: '2rem 1rem 0rem', marginTop: '2rem' }}>
                <div style={{ flex: 1, maxWidth: '50vw', textAlign: 'center' }}>
                    <img
                        id="planograma-img"
                        src={planogramaSA3}
                        alt="Planograma"
                        onClick={() => {
                            const img = document.getElementById('planograma-img');
                            if (document.fullscreenElement) {
                                document.exitFullscreen();
                            } else {
                                if (img.requestFullscreen) {
                                    img.requestFullscreen();
                                } else if (img.webkitRequestFullscreen) {
                                    img.webkitRequestFullscreen();
                                } else if (img.msRequestFullscreen) {
                                    img.msRequestFullscreen();
                                }
                            }
                        }}
                        style={{
                            width: '100%',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            cursor: 'pointer' // Para que se note que se puede clickear
                        }}
                    />

                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '0.5rem'
                        }}
                    >
                        <button
                            onClick={() => {
                                const img = document.getElementById('planograma-img');
                                if (document.fullscreenElement) {
                                    document.exitFullscreen();
                                } else {
                                    img.requestFullscreen?.() || img.webkitRequestFullscreen?.() || img.msRequestFullscreen?.();
                                }
                            }}
                            className="tipo-btn"
                        >
                            🔍 Ver en pantalla completa
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1.2 }}>
                    <button
                        onClick={() => navigate('/buscar-producto')}
                        className="boton-flotante-inicio"
                    >
                        🔎 Buscar Producto
                    </button>
                    {/* Acá va el contenido que ya tenías: botones, selector, carga, etc */}
                    <h2 className='titulo-home'>📦 Carga de Productos por Ubicación</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <button
                            onClick={() => {
                                // Construir la ubicación actual según la selección
                                const currentUbicacion = `${tipoSeleccionado}${numeroSeleccionado}${tipoSeleccionado === 'G' ? division + numeroDivision : ''
                                    }${subdivisionSeleccionada}`;
                                console.log("Descargando TXT para ubicación:", currentUbicacion);

                                // Armar la URL usando ese valor
                                const url = `https://exhibicionback-production.up.railway.app/ubicaciones/txt?sucursal=${sucursalId}&ubicacion=${currentUbicacion}`;

                                window.open(url, '_blank');
                            }}
                            className="boton-flotante-txt"
                        >
                            📥 Descargar TXT
                        </button>

                    </div>


                    {!ubicacionConfirmada ? (
                        <SelectorUbicacion
                            codigoUbicacion={codigoUbicacion}
                            setUbicacionConfirmada={setUbicacionConfirmada}
                            ubicacionConfirmada={ubicacionConfirmada}
                            tipoSeleccionado={tipoSeleccionado}
                            setTipoSeleccionado={setTipoSeleccionado}
                            numeroSeleccionado={numeroSeleccionado}
                            setNumeroSeleccionado={setNumeroSeleccionado}
                            division={division}
                            setDivision={setDivision}
                            numeroDivision={numeroDivision}
                            setNumeroDivision={setNumeroDivision}
                            subdivisionSeleccionada={subdivisionSeleccionada}
                            setSubdivisionSeleccionada={setSubdivisionSeleccionada}
                            numeros={numeros}
                            subdivisiones={subdivisiones}
                            handleConfirmarUbicacion={handleConfirmarUbicacion}
                        />

                    ) : (
                        <CargaProductos
                            enProceso={enProceso}
                            setEnProceso={setEnProceso}
                            errorProducto={errorProducto}
                            setErrorProducto={setErrorProducto}
                            codigoUbicacion={codigoUbicacion}
                            setUbicacionConfirmada={setUbicacionConfirmada}
                            ubicacionConfirmada={ubicacionConfirmada}
                            codigoBarras={codigoBarras}
                            setCodigoBarras={setCodigoBarras}
                            cantidad={cantidad}
                            setCantidad={setCantidad}
                            handleAgregarProducto={handleAgregarProducto}
                            loading={loading}
                            productosCargados={productosCargados}
                            handleActualizarCantidad={handleActualizarCantidad}
                            handleEliminarProducto={handleEliminarProducto}
                            handleReubicarProducto={handleReubicarProducto}
                            mostrarModalCantidad={mostrarModalCantidad}
                            productoExistente={productoExistente}
                            handleGuardarDesdeModal={handleGuardarDesdeModal}
                            mostrarModalDuplicado={mostrarModalDuplicado}
                            productoDuplicado={productoDuplicado}
                            ubicacionAnterior={ubicacionAnterior}
                            handleConfirmarDuplicado={handleConfirmarDuplicado}
                            setMostrarModalCantidad={setMostrarModalCantidad}
                            setMostrarModalDuplicado={setMostrarModalDuplicado}
                            setProductoDuplicado={setProductoDuplicado}
                            crearProducto={crearProducto}
                        />
                    )}

                </div>
            </div>
        </>
    );
};

export default HomeSucursal;
