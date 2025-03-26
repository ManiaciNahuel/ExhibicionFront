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
            <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
                <h3>🛑 Producto ya cargado</h3>
                <p><strong>{producto.nombre}</strong> ({producto.codigo}) ya está en esta ubicación.</p>
                <label>Editar cantidad:</label>
                <input
                    type="number"
                    value={nuevaCantidad}
                    min="1"
                    onChange={(e) => setNuevaCantidad(e.target.value)}
                    style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem' }}
                />
                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <button onClick={onClose} style={{ marginRight: '1rem' }}>❌ Cancelar</button>
                    <button onClick={handleSubmit}>💾 Guardar</button>
                </div>
            </div>
        </div>
    );
};

export default ModalEditarCantidad;
