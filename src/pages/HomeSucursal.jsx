import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/HomeSucursal.css';
import CargaProductos from '../components/CargaProductos';
import SelectorUbicacion from '../components/SelectorUbicacion';
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL;

const HomeSucursal = () => {
    const [tipoSeleccionado, setTipoSeleccionado] = useState('');
    const [numeroSeleccionado, setNumeroSeleccionado] = useState('');
    const [subdivisionSeleccionada, setSubdivisionSeleccionada] = useState('');
    const [subdivision, setSubdivision] = useState('');
    const [numeroSubdivisionSeleccionada, setNumeroSubdivisionSeleccionada] = useState('');

    const [codigoUbicacion, setCodigoUbicacion] = useState('');
    const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);
    const [errorProducto, setErrorProducto] = useState('');

    const [codigoBarras, setCodigoBarras] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [productosCargados, setProductosCargados] = useState([]);
    const [ubicacionesPermitidas, setUbicacionesPermitidas] = useState([]);
    const [division, setDivision] = useState('');
    const [numeroDivision, setNumeroDivision] = useState('');

    const [loading, setLoading] = useState(false);
    const [productoExistente, setProductoExistente] = useState(null);
    const [mostrarModalCantidad, setMostrarModalCantidad] = useState(false);
    const [enProceso, setEnProceso] = useState(new Set());

    const sucursalId = localStorage.getItem('sucursalId');
    const [planogramaSrc, setPlanogramaSrc] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        if (!sucursalId) return;
        axios.get(`${API_URL}/planogramas/${sucursalId}`)
            .then(res => setPlanogramaSrc(`${API_URL}${res.data.imagen}`))
            .catch(() => setPlanogramaSrc(''));
    }, [sucursalId]);

    const fetchProductosEnUbicacion = React.useCallback(async () => {
        console.log("🔍 Fetching productos para:", { sucursalId, codigoUbicacion });
        try {
            const res = await axios.get(`${API_URL}/ubicaciones`, {
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
    }, [sucursalId, codigoUbicacion]);

    useEffect(() => {
        if (ubicacionConfirmada && codigoUbicacion) {
            fetchProductosEnUbicacion();
        }
    }, [ubicacionConfirmada, codigoUbicacion, fetchProductosEnUbicacion]);

    useEffect(() => {
        const fetchUbicacionesPermitidas = async () => {
            try {
                const res = await axios.get(`${API_URL}/ubicaciones/permitidas?sucursalId=${sucursalId}`);
                const data = res.data.map(u => ({
                    tipo: u.tipo,
                    numeroUbicacion: u.numeroUbicacion,
                    division: u.division,
                    numeroDivision: u.numeroDivision,
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
            const res = await axios.get(`${API_URL}/ubicaciones`, {
                params: {
                    sucursal: sucursalId,
                    ubicacion: codigo
                }
            });

            const productos = res.data.map(p => ({
                id: p.id,
                nombre: `${p.producto?.Producto || ''} ${p.producto?.Presentaci || ''}`.trim() || 'Cargando',
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
            let producto = null;
            let codigoUsado = codigoBarras;

            try {
                const res = await axios.get(`${API_URL}/productos/${codigoBarras}`);
                producto = res.data;
            } catch (e) {
                // No encontrado, intentamos sin ceros
                if (/^0+/.test(codigoBarras)) {
                    const sinCeros = codigoBarras.replace(/^0+/, '');
                    try {
                        const res2 = await axios.get(`${API_URL}/productos/${sinCeros}`);
                        producto = res2.data;
                        codigoUsado = sinCeros;
                    } catch (e2) {
                        // no encontrado tampoco
                    }
                }
            }

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

            const resCheck = await axios.get(`${API_URL}/ubicaciones/check`, {
                params: { codplex: producto.CodPlex, sucursalId }
            });

            const yaEnOtraUbicacion = resCheck.data.find(p => p.ubicacion !== codigoUbicacion);

            if (yaEnOtraUbicacion) {
                toast.info(`ℹ️ ${producto.Producto || 'Producto'} ya está en la ubicación ${yaEnOtraUbicacion.ubicacion}. Se agregó también acá.`);
            }

            // Lo agregamos (si ya estaba en otra ubicación, queda en ambas)
            await crearProducto(
                producto,
                codigoUsado,
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
        }
    };




    const crearProducto = async (producto, codigo, cantidad, tipo, numero, subdivision, numeroSubdivision, division, numeroDivision) => {
        try {
            const res = await axios.post(`${API_URL}/ubicaciones`, {
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
                    nombre: `${producto.Producto || ''} ${producto.Presentaci || ''}`.trim() || 'Cargando',
                    codigo,
                    cantidad,
                    codplex: producto.CodPlex, // 👈 clave para que funcione el find
                    ubicacion: `${tipo}${numero}${division || ''}${numeroDivision || ''}${subdivision || ''}${numeroSubdivision || ''}`

                }
            ]);
            setCantidad('');
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
            await axios.delete(`${API_URL}/ubicaciones/${id}`);
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
            await axios.put(`${API_URL}/ubicaciones/${id}`, {
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

    useEffect(() => {
        if (subdivisionSeleccionada) {
            const letra = subdivisionSeleccionada.match(/[A-Za-z]/)?.[0] || '';
            const numero = subdivisionSeleccionada.match(/\d+/)?.[0] || '';
            setSubdivision(letra);
            setNumeroSubdivisionSeleccionada(numero);
        } else {
            setSubdivision('');
            setNumeroSubdivisionSeleccionada('');
        }
    }, [subdivisionSeleccionada]);



    return (
        <>
            <div className="carga-page" style={{ display: 'flex', gap: '2rem', padding: '2rem 1rem 0rem', marginTop: '2rem' }}>
                <div style={{ flex: 1, maxWidth: '50vw', textAlign: 'center' }}>
                    {planogramaSrc ? (
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
                                width: '100%',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                cursor: 'pointer',
                                maxHeight: '75vh',
                                objectFit: 'contain'
                            }}
                        />
                    ) : (
                        <p>No hay planograma cargado para esta sucursal.</p>
                    )}


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
                            onClick={async () => {
                                const currentUbicacion = `${tipoSeleccionado}${numeroSeleccionado}${tipoSeleccionado === 'G' ? division + numeroDivision : ''
                                    }${subdivisionSeleccionada}`;

                                console.log("📥 Descargando TXT para ubicación:", currentUbicacion);

                                try {
                                    const queryParams = new URLSearchParams({
                                        sucursal: sucursalId,
                                        tipo: tipoSeleccionado,
                                        numeroUbicacion: numeroSeleccionado,
                                    });

                                    if (division && numeroDivision) {
                                        queryParams.append('division', division);
                                        queryParams.append('numeroDivision', numeroDivision);
                                    }
                                    if (subdivision && numeroSubdivisionSeleccionada) {
                                        queryParams.append('subdivision', subdivision);
                                        queryParams.append('numeroSubdivision', numeroSubdivisionSeleccionada);
                                    }

                                    const response = await fetch(
                                        `${API_URL}/ubicaciones/txt-info?${queryParams.toString()}`
                                    );


                                    const data = await response.json();

                                    if (!response.ok) throw new Error(data.error || 'Error desconocido');

                                    // Mostrar aviso si hay códigos omitidos
                                    if (data.omitidos && data.omitidos.length > 0) {
                                        alert(`⚠️ Se omitieron ${data.omitidos.length} códigos alfanuméricos:\n\n${data.omitidos.join('\n')}`);
                                    }

                                    // Crear Blob y descargar
                                    const blob = new Blob([data.archivo], { type: 'text/plain;charset=utf-8' });
                                    saveAs(blob, data.nombreArchivo);

                                } catch (err) {
                                    console.error("❌ Error al descargar archivo TXT: ", err);
                                    alert("Error al generar el archivo. Por favor intentá nuevamente.");
                                }
                            }}
                            className="boton-flotante-txt"
                        >
                            📥 Descargar TXT
                        </button>

                    </div>


                    {!ubicacionConfirmada ? (
                        <SelectorUbicacion
                            ubicacionesPermitidas={ubicacionesPermitidas}
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
                            setMostrarModalCantidad={setMostrarModalCantidad}
                        />
                    )}

                </div>
            </div>
        </>
    );
};

export default HomeSucursal;
