import React, { useState } from 'react';
import SelectorUbicacion from './SelectorUbicacion';

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
            <SelectorUbicacion
                sucursalId={parseInt(localStorage.getItem('sucursalId'))}
                onConfirm={(codigo) => {
                    setNuevaUbicacion(codigo);
                    onConfirmar(codigo); // Llama al handler de reubicación con la ubicación validada
                    onClose();
                }}
            />

            <p>La cantidad actual es: <strong>{cantidad}</strong></p>
            <button onClick={handleConfirm}>✅ Confirmar</button>
            <button onClick={onClose} style={{ marginLeft: '10px' }}>❌ Cancelar</button>
        </div>
    );
};

export default ConfirmarAccionModal;
