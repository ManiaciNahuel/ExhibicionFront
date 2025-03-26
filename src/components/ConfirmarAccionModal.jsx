import React, { useState } from 'react';

const ConfirmarAccionModal = ({ cantidad, onClose, onConfirmar }) => {
    const [nuevaUbicacion, setNuevaUbicacion] = useState('');

    const handleConfirm = () => {
        if (nuevaUbicacion.trim() === '') {
            alert("Ingresá una ubicación");
            return;
        }
        onConfirmar(nuevaUbicacion);
    };

    return (
        <div className="modal" style={{
            position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#fff', padding: '20px', border: '1px solid #ccc', zIndex: 1000
        }}>
            <h4>🔀 Mover producto</h4>
            <label>Nueva ubicación:</label>
            <input
                type="text"
                value={nuevaUbicacion}
                onChange={(e) => setNuevaUbicacion(e.target.value.toUpperCase())}
                placeholder="Ej: G2E1"
            />
            <p>La cantidad actual es: <strong>{cantidad}</strong></p>
            <button onClick={handleConfirm}>✅ Confirmar</button>
            <button onClick={onClose} style={{ marginLeft: '10px' }}>❌ Cancelar</button>
        </div>
    );
};

export default ConfirmarAccionModal;
