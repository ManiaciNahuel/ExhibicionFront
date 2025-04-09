import React, { useState } from 'react';

const ModalEditarCantidad = ({ producto, onClose, onGuardar }) => {
    const [nuevaCantidad, setNuevaCantidad] = useState(producto.cantidad || 1);

    const handleSubmit = () => {
        const cantidad = parseInt(nuevaCantidad);
        if (isNaN(cantidad) || cantidad < 1) {
            alert("Cantidad inválida");
            return;
        }
        onGuardar(producto.id, cantidad);
        onClose()
    };


    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
                <h3 >🛑 Producto ya cargado</h3>
                <p><strong>{producto.nombre}</strong> ({producto.codigo}) ya está en esta ubicación.</p>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <label>Editar cantidad: </label>
                    <input
                        type="number"
                        value={nuevaCantidad}
                        min="1"
                        onChange={(e) => setNuevaCantidad(e.target.value)}
                        style={{ width: '4rem', padding: '0.5rem', marginLeft: '1rem', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                </div>
                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <button onClick={handleSubmit} style={{ margin: '0rem 1rem' }} className="btn-accion">💾 Guardar</button>
                    <button onClick={onClose} className="btn-eliminar">❌ Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default ModalEditarCantidad;
