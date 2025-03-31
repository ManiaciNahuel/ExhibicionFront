import React, { useState, useEffect } from 'react';
import SelectorUbicacion from './SelectorUbicacion';
import axios from 'axios';

const ConfirmarAccionModal = ({ onConfirm, onCancel, cantidad }) => {
  const [ubicacionesPermitidas, setUbicacionesPermitidas] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [numeroSeleccionado, setNumeroSeleccionado] = useState('');
  const [subdivisionSeleccionada, setSubdivisionSeleccionada] = useState('');

  const sucursalId = localStorage.getItem('sucursalId');

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/ubicaciones/permitidas?sucursalId=${sucursalId}`);
        const data = res.data.map(u => ({
          tipo: u.tipo,
          numeroUbicacion: u.numeroUbicacion,
          subdivision: u.subdivision,
          numeroSubdivision: u.numeroSubdivision,
          codigo: `${u.tipo}${u.numeroUbicacion}${u.subdivision || ''}${u.numeroSubdivision || ''}`
        }));
        setUbicacionesPermitidas(data);
      } catch (err) {
        console.error("❌ Error al obtener ubicaciones permitidas en modal:", err);
      }
    };

    fetchUbicaciones();
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

  const handleConfirmarUbicacion = (e) => {
    e.preventDefault();
    const codigo = `${tipoSeleccionado}${numeroSeleccionado}${subdivisionSeleccionada}`;
    onConfirm(codigo); // Esto lo recibe ProductoEnUbicacion
  };

  return (
    <div className="modal" style={{
      position: 'fixed',
      top: '30%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#fff',
      padding: '20px',
      border: '1px solid #ccc',
      zIndex: 1000,
      width: '80%',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <h4>🔀 Mover producto</h4>
      <p>La cantidad actual es: <strong>{cantidad}</strong></p>

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

      <div style={{ marginTop: '1rem' }}>
        <button onClick={onCancel}>❌ Cancelar</button>
      </div>
    </div>
  );
};

export default ConfirmarAccionModal;
