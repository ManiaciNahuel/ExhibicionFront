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
        if (ubicacionConfirmada && codigoUbicacion) {
            fetchProductosEnUbicacion();
        }
    }, [ubicacionConfirmada, codigoUbicacion]);

    const fetchProductosEnUbicacion = async () => {
        console.log("🔍 Fetching productos para:", { sucursalId, codigoUbicacion });
        try {
            const res = await axios.get(`http://localhost:3000/ubicaciones`, {
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



    const handleConfirmarUbicacion = async (e) => {
        e.preventDefault();
        const codigo = `${tipoSeleccionado}${numeroSeleccionado}${subdivisionSeleccionada}`;
        setCodigoUbicacion(codigo);
        setUbicacionConfirmada(true);
        setLoading(true); // ⏳ Empezamos a cargar
    
        try {
            const res = await axios.get(`http://localhost:3000/ubicaciones`, {
                params: {
                    sucursal: sucursalId,
                    ubicacion: codigo
                }
            });
    
            const productos = res.data.map(p => ({
                id: p.id,
                nombre: p.producto?.nombre || 'Sin nombre',
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
    
        const { codebar, cantidad, tipo, numero, subdivision, numeroSubdivision } = productoDuplicado;
    
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
    
        await crearProducto(productoDuplicado, codebar, cantidad, tipo, numero, subdivision, numeroSubdivision);
        setMostrarModalDuplicado(false);
        setProductoDuplicado(null);
    };


    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h2>📦 Carga de Productos por Ubicación</h2>

            {!ubicacionConfirmada ? (
                <SelectorUbicacion  
                    tipoSeleccionado={tipoSeleccionado}
                    setTipoSeleccionado={setTipoSeleccionado}
                    numeroSeleccionado={numeroSeleccionado}
                    setNumeroSeleccionado={setNumeroSeleccionado}
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
    );
};

export default HomeSucursal;
