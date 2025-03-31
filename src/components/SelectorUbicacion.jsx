import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/SelectorUbicacion.css'; // por si querés separar estilos

const SelectorUbicacion = ({ sucursalId, onConfirm }) => {
  const [ubicacionesPermitidas, setUbicacionesPermitidas] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [numeroSeleccionado, setNumeroSeleccionado] = useState('');
  const [subdivisionSeleccionada, setSubdivisionSeleccionada] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/ubicaciones/permitidas?sucursalId=${sucursalId}`);
        setUbicacionesPermitidas(res.data);
      } catch (err) {
        console.error("❌ Error al traer ubicaciones permitidas", err);
      }
    };
    fetch();
  }, [sucursalId]);

  const tipos = [...new Set(ubicacionesPermitidas.map(u => u.tipo))];
  const numeros = ubicacionesPermitidas
    .filter(u => u.tipo === tipoSeleccionado)
    .map(u => u.numeroUbicacion);
  const subdivisiones = ubicacionesPermitidas
    .filter(u => u.tipo === tipoSeleccionado && u.numeroUbicacion === Number(numeroSeleccionado))
    .map(u => `${u.subdivision}${u.numeroSubdivision || ''}`);

  const confirmar = () => {
    const codigo = `${tipoSeleccionado}${numeroSeleccionado}${subdivisionSeleccionada}`;
    if (!tipoSeleccionado || !numeroSeleccionado || !subdivisionSeleccionada) {
      alert('Seleccioná una ubicación válida');
      return;
    }
    onConfirm(codigo);
  };

  return (
    <div style={{
        padding: '2rem',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#fbfaf8',
        borderRadius: '10px'
      }}>
      <h2 style={{ marginBottom: '2rem' }}>📍 Seleccionar nueva ubicación</h2>

      <div className="tipo-selector">
        <h4>Tipo de ubicación:</h4>
        {tipos.map((tipo) => (
          <button
            key={tipo}
            className={`tipo-btn ${tipoSeleccionado === tipo ? "activo" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setTipoSeleccionado(tipo);
              setNumeroSeleccionado('');
              setSubdivisionSeleccionada('');
            }}
          >
            {tipo === "M" ? "🧱 Módulo" : tipo === "G" ? "🛒 Góndola" : "📌 Puntera"}
          </button>
        ))}
      </div>

      {tipoSeleccionado && (
        <div className="numero-selector">
          <h4>Número:</h4>
          {[...new Set(numeros)].map((n) => (
            <button
              key={n}
              className={`numero-btn ${numeroSeleccionado === n ? "activo" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setNumeroSeleccionado(n);
                setSubdivisionSeleccionada('');
              }}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {numeroSeleccionado && (
        <div className="subdivision-selector">
          <h4>Estante / Fila:</h4>
          {[...new Set(subdivisiones)].map((s) => (
            <button
              key={s}
              className={`subdivision-btn ${subdivisionSeleccionada === s ? "activo" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setSubdivisionSeleccionada(s);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {subdivisionSeleccionada && (
        <button onClick={confirmar} className="btn-confirmar-ubicacion">
          ✅ Confirmar Ubicación
        </button>
      )}
    </div>
  );
};

export default SelectorUbicacion;
