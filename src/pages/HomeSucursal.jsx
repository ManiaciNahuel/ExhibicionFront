import React, { useState, useEffect } from 'react';
import axios from 'axios';

import '../styles/HomeSucursal.css';
import CargaProductos from '../components/CargaProductos';
import SelectorUbicacion from '../components/SelectorUbicacion';


const HomeSucursal = () => {
    const [tipoSeleccionado, setTipoSeleccionado] = useState('');
    const [numeroSeleccionado, setNumeroSeleccionado] = useState('');
    const [subdivisionSeleccionada, setSubdivisionSeleccionada] = useState('');
    const [codigoUbicacion, setCodigoUbicacion] = useState('');
    const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);
    const [productosCargando, setProductosCargando] = useState(new Set());

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
            setProductosCargando(prev => new Set(prev).add(codigoBarras));

            const res = await axios.get(`https://exhibicionback-production.up.railway.app/productos/${codigoBarras}`);
            const producto = res.data;
            if (!producto) {
                alert('Producto no encontrado');
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
                numeroDivision
            );

        } catch (err) {
            console.error("❌ Error al asignar producto:", err);
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
                    ubicacion: `${tipo}${numero}${division || ''}${numeroDivision || ''}${subdivision || ''}${numeroSubdivision || ''}`

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
            {enProceso.size > 0 && (
                <div style={{
                    position: 'fixed',
                    top: 10,
                    right: 10,
                    background: '#222',
                    color: '#fff',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    zIndex: 999,
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}>
                    🕓 Agregando {enProceso.size} producto{enProceso.size > 1 ? 's' : ''}...
                </div>
            )}

            <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
                <h2>📦 Carga de Productos por Ubicación</h2>

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
        </>
    );
};

export default HomeSucursal;
