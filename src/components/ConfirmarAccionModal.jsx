import React, { useState, useEffect } from 'react';
import SelectorUbicacion from './SelectorUbicacion';
import axios from 'axios';
import '../styles/ConfirmarAccionModal.css'

const ConfirmarAccionModal = ({ onConfirm, onCancel, cantidad, producto }) => {
  const [ubicacionesPermitidas, setUbicacionesPermitidas] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [numeroSeleccionado, setNumeroSeleccionado] = useState('');
  const [subdivisionSeleccionada, setSubdivisionSeleccionada] = useState('');
  const [division, setDivision] = useState('');
  const [numeroDivision, setNumeroDivision] = useState('');
  const [moviendo, setMoviendo] = useState(false);

  const sucursalId = localStorage.getItem('sucursalId');

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const res = await axios.get(`https://exhibicionback-production.up.railway.app/ubicaciones/permitidas?sucursalId=${sucursalId}`);
        const data = res.data.map(u => ({
          tipo: u.tipo,
          numeroUbicacion: u.numeroUbicacion,
          division: u.division,
          numeroDivision: u.numeroDivision,
          subdivision: u.subdivision,
          numeroSubdivision: u.numeroSubdivision,
          codigo: `${u.tipo}${u.numeroUbicacion}${u.division || ''}${u.numeroDivision || ''}${u.subdivision || ''}${u.numeroSubdivision || ''}`
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

  const handleConfirmarUbicacion = async (e) => {
    e.preventDefault();
    if (moviendo) return; // Previene doble click
    setMoviendo(true);

    const codigo = `${tipoSeleccionado}${numeroSeleccionado}${division || ''}${numeroDivision || ''}${subdivisionSeleccionada}`;
    await onConfirm(codigo); // Aseguramos que sea async (por si el padre lo maneja así)
    setMoviendo(false);
  };



  return (
    <div className="modal-overlay">
      <div className="modal-contenido">
        {/* Botón de cierre */}
        <button className="modal-cerrar" onClick={onCancel}>❌</button>

        <h3 className="modal-titulo">🔀 Mover producto:</h3>
        <p className="modal-subtexto">
          {producto?.producto?.nombre || producto?.Producto || producto?.nombre || 'Producto desconocido'}{' '}
          {producto?.presentacion || producto?.Presentaci || ''}
        </p>

        <SelectorUbicacion
          moviendo={moviendo}
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
      </div>
    </div>
  );
};

export default ConfirmarAccionModal;
