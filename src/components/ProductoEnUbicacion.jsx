import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ConfirmarAccionModal from './ConfirmarAccionModal';
import '../styles/ProductoEnUbicacion.css';

const API_URL = process.env.REACT_APP_API_URL;

const ProductoEnUbicacion = ({ producto, onActualizar, onEliminar, onReubicar, onAgregarUbicacionSiFalta }) => {
    const [modoEdicion, setModoEdicion] = useState(false);
    const [cantidadEditada, setCantidadEditada] = useState(producto.cantidad);
    const [mostrarModal, setMostrarModal] = useState(false);

    // Nuevos estados locales para mover ubicación
    const [tipoSeleccionado, setTipoSeleccionado] = useState('');
    const [numeroSeleccionado, setNumeroSeleccionado] = useState('');
    const [subdivisionSeleccionada, setSubdivisionSeleccionada] = useState('');

    useEffect(() => {
        if (producto.autoEditar) {
            setModoEdicion(true);
        }
    }, [producto.autoEditar]);

    const handleGuardar = async () => {
        try {
            await axios.put(`${API_URL}/ubicaciones/${producto.id}`, {
                cantidad: parseInt(cantidadEditada),
                sucursalId: parseInt(localStorage.getItem('sucursalId'))
            });
            setModoEdicion(false);
            onActualizar(producto.id, parseInt(cantidadEditada));
        } catch (err) {
            console.error('❌ Error al actualizar:', err);
            alert('Error al actualizar');
        }
    };

    const handleConfirmarReubicacion = async (nuevaUbicacion) => {
        try {
            const tipo = nuevaUbicacion.match(/^[A-Z]+/)[0];
            let resto = nuevaUbicacion.replace(tipo, '');

            const numero = parseInt(resto.match(/^\d+/)[0]);
            resto = resto.replace(numero, '');

            // 🧩 Extraer división y número de división (solo para góndolas)
            let division = null;
            let numeroDivision = null;

            if (tipo === 'G') {
                division = resto[0]; // 'P' o 'L'
                resto = resto.slice(1);
                numeroDivision = parseInt(resto[0]); // 1 o 2
                resto = resto.slice(1);
            }

            const subdivision = resto[0] || null;
            const tempNumSub = parseInt(resto.slice(1));
            const numeroSubdivision = Number.isNaN(tempNumSub) ? null : tempNumSub;

            const sucursalId = parseInt(localStorage.getItem('sucursalId'));

            console.log("📦 Reubicando con datos:", {
                codebar: producto.codigo,
                tipo,
                numero,
                division,
                numeroDivision,
                subdivision,
                numeroSubdivision,
                cantidad: producto.cantidad,
                sucursalId
            });

            const check = await axios.get(`${API_URL}/ubicaciones?sucursal=${sucursalId}&ubicacion=${nuevaUbicacion}`);
            const yaExiste = check.data.find(p => p.codebar === producto.codigo);

            if (yaExiste) {
                console.log("🗑 Eliminando producto con ID:", producto.id);

                alert(`⚠️ El producto "${producto.nombre}" ya existe en la ubicación "${nuevaUbicacion}". 
    Si desea editar las cantidades, diríjase a esa ubicación. De todos modos, queda eliminado el producto de esta ubicación.`);
                await axios.delete(`${API_URL}/ubicaciones/${producto.id}`);
                onReubicar(producto.id);
                setMostrarModal(false);
                return;
            }

            // ✅ Crear en nueva ubicación
            const res = await axios.post(`${API_URL}/ubicaciones`, {
                codebar: producto.codebar || producto.codigo,
                tipo,
                numero,
                division,
                numeroDivision,
                subdivision,
                numeroSubdivision,
                cantidad: producto.cantidad,
                sucursalId
            });

            const nuevaUbic = `${tipo}${numero}${division || ''}${numeroDivision || ''}${subdivision || ''}${numeroSubdivision || ''}`;

            const nuevoProducto = {
                id: res.data.id,
                nombre: producto.nombre,
                codigo: producto.codigo,
                cantidad: producto.cantidad,
                ubicacion: nuevaUbic
            };

            console.log("🗑 Eliminando producto con ID:", producto.id);
            await axios.delete(`${API_URL}/ubicaciones/${producto.id}`);
            onReubicar(producto.id, nuevoProducto, nuevaUbic);
            onAgregarUbicacionSiFalta?.(nuevoProducto);

            setMostrarModal(false);
        } catch (err) {
            console.error("❌ Error al reubicar:", err);
            alert('Error al reubicar');
        }
    };


    return (
        <div className="producto-en-ubicacion">
            <strong>
                {producto?.producto?.nombre || producto?.Producto || producto?.nombre || 'Cargando producto'} {producto?.presentacion || producto?.Presentaci || ''}
            </strong> ({producto.codigo || producto.codebar})
            <br />
            Cantidad:{' '}
            {modoEdicion ? (
                <input
                    type="number"
                    value={cantidadEditada}
                    onChange={(e) => setCantidadEditada(e.target.value)}
                    className="input-cantidad-editar"
                />
            ) : (
                <span>{producto.cantidad}</span>
            )}
            <br />

            <div className="botones-producto">
                {modoEdicion ? (
                    <button onClick={handleGuardar} className="btn-secundario">💾 Guardar</button>
                ) : (
                    <button onClick={() => setModoEdicion(true)} className="btn-secundario">✏️ Editar cantidad</button>
                )}

                <button onClick={() => setMostrarModal(true)} className="btn-accion">🚚 Mover</button>

                <button onClick={() => onEliminar(producto.id)} className="btn-eliminar">🗑 Eliminar</button>
            </div>

            {mostrarModal && (
                <ConfirmarAccionModal
                    onConfirm={handleConfirmarReubicacion}
                    onCancel={() => setMostrarModal(false)}
                    tipoSeleccionado={tipoSeleccionado}
                    numeroSeleccionado={numeroSeleccionado}
                    subdivisionSeleccionada={subdivisionSeleccionada}
                    setTipoSeleccionado={setTipoSeleccionado}
                    setNumeroSeleccionado={setNumeroSeleccionado}
                    setSubdivisionSeleccionada={setSubdivisionSeleccionada}
                    cantidad={producto.cantidad}
                    producto={producto}
                />
            )}
        </div>
    );
};

export default ProductoEnUbicacion;
