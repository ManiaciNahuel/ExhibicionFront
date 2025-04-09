import React from 'react';

const ModalProductoEnOtraUbicacion = ({ producto, ubicacionAnterior, onConfirmar, onClose }) => {
    if (!producto) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
        }}>
            <div style={{
                backgroundColor: '#fff',
                padding: '2rem',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '450px'
            }}>
                <h3>🔴 Producto ya cargado</h3>
                <p><strong>{producto.nombre || 'Producto'}</strong> ({producto.codebar}) ya está en la ubicación <strong>{ubicacionAnterior}</strong>.</p>
                <p>¿Qué querés hacer?</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                    <button
                        style={{ padding: '0.5rem', border: '1px solid #28a745'}}
                        className="btn-secundario"
                        onClick={() => onConfirmar('ambas')}
                    >
                        ✅ Agregar en ambas
                    </button>

                    <button
                        style={{ padding: '0.5rem' }}

                        className="btn-secundario"
                        onClick={() => onConfirmar('mover')}
                    >
                        🚚 Mover a nueva ubicación
                    </button>

                    <button
                    className="btn-eliminar"
                        style={{ padding: '0.5rem' }}
                        onClick={onClose}
                    >
                        ❌ Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalProductoEnOtraUbicacion;
