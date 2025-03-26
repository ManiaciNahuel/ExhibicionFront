import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ConfirmarAccionModal from './ConfirmarAccionModal';

const ProductoEnUbicacion = ({ producto, onActualizar, onEliminar, onReubicar }) => {
    const [modoEdicion, setModoEdicion] = useState(false);
    const [cantidadEditada, setCantidadEditada] = useState(producto.cantidad);
    const [mostrarModal, setMostrarModal] = useState(false);

    useEffect(() => {
        if (producto.autoEditar) {
            setModoEdicion(true);
        }
    }, [producto.autoEditar]);

    const handleGuardar = async () => {
        try {
            await axios.put(`http://localhost:3000/ubicaciones/${producto.id}`, {
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
            const resto = nuevaUbicacion.replace(tipo, '');
            const numero = parseInt(resto.match(/\d+/)[0]);
            const subdivision = resto.replace(numero, '') || null;
            const sucursalId = parseInt(localStorage.getItem('sucursalId'));
    
            const check = await axios.get(`http://localhost:3000/ubicaciones?sucursal=${sucursalId}&ubicacion=${nuevaUbicacion}`);
            const yaExiste = check.data.find(p => p.codebar === producto.codigo);
    
            if (yaExiste) {
                alert(`⚠️ El producto "${producto.nombre}" ya existe en la ubicación "${nuevaUbicacion}". 
    Si desea editar las cantidades, diríjase a esa ubicación. De todos modos, queda eliminado el producto de esta ubicacion`);
                
                // Igualmente eliminamos el producto de la ubicación actual
                await axios.delete(`http://localhost:3000/ubicaciones/${producto.id}`);
                onReubicar(producto.id);
                setMostrarModal(false);
                return;
            }
    
            // Crear en nueva ubicación
            await axios.post('http://localhost:3000/ubicaciones', {
                codebar: producto.codigo,
                tipo,
                numero,
                subdivision,
                cantidad: producto.cantidad,
                sucursalId
            });
    
            // Eliminar de la ubicación actual
            await axios.delete(`http://localhost:3000/ubicaciones/${producto.id}`);
            onReubicar(producto.id);
            setMostrarModal(false);
    
        } catch (err) {
            console.error("❌ Error al reubicar:", err);
            alert('Error al reubicar');
        }
    };
    

    return (
        <div style={{ marginBottom: '0.5rem', padding: '0.5rem', border: '1px solid #ccc' }}>
            <strong>{producto.nombre}</strong> ({producto.codigo})<br />
            Cantidad:{" "}
            {modoEdicion ? (
                <input
                    type="number"
                    value={cantidadEditada}
                    onChange={(e) => setCantidadEditada(e.target.value)}
                />
            ) : (
                <span>{producto.cantidad}</span>
            )}
            <br />

            {modoEdicion ? (
                <button onClick={handleGuardar}>💾 Guardar</button>
            ) : (
                <button onClick={() => setModoEdicion(true)}>✏️ Editar cantidad</button>
            )}

            <button onClick={() => setMostrarModal(true)} style={{ marginLeft: '10px' }}>
                🚚 Mover
            </button>

            <button onClick={() => onEliminar(producto.id)} style={{ marginLeft: '10px' }}>
                🗑 Eliminar
            </button>

            {mostrarModal && (
                <ConfirmarAccionModal
                    onClose={() => setMostrarModal(false)}
                    onConfirmar={handleConfirmarReubicacion}
                />
            )}
        </div>
    );
};

export default ProductoEnUbicacion;
