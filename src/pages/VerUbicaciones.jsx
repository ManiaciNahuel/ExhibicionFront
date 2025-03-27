import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/VerUbicaciones.css';

const VerUbicaciones = () => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacionActiva, setUbicacionActiva] = useState(null);
  const [loading, setLoading] = useState(true);

  const sucursalId = localStorage.getItem('sucursalId');
  const nombreSucursal = localStorage.getItem('nombreSucursal') || "Sucursal";

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        setLoading(true); // 👈 Empezar a cargar
        const res = await axios.get(`http://localhost:3000/ubicaciones/todas?sucursalId=${sucursalId}`);
        setUbicaciones(res.data);
      } catch (err) {
        console.error("❌ Error al obtener ubicaciones:", err);
      } finally {
        setLoading(false); // 👈 Terminar carga
      }
    };

    fetchUbicaciones();
  }, [sucursalId]);

  const toggleUbicacion = (codigo) => {
    setUbicacionActiva(prev => (prev === codigo ? null : codigo));
  };

  return (
    <div className="ver-ubicaciones-container">
      <h2>📦 Ubicaciones de {nombreSucursal}</h2>

      {loading ? (
        <p>⏳ Cargando productos...</p>
      ) : ubicaciones.length === 0 ? (
        <p>No hay productos cargados aún.</p>
      ) : (
        <ul className="ubicaciones-lista">
          {ubicaciones.map((u) => (
            <li key={u.ubicacion} className="ubicacion-item">
              <div className="ubicacion-header" onClick={() => toggleUbicacion(u.ubicacion)}>
                <strong>{u.ubicacion}</strong> ({u.productos.length} producto{u.productos.length !== 1 ? 's' : ''})
              </div>
              {ubicacionActiva === u.ubicacion && (
                <ul className="productos-lista">
                  {u.productos.map((p) => (
                    <li key={p.codebar}>
                      <span>{p.nombre}</span> – <code>{p.codebar}</code> – <strong>{p.cantidad}</strong> unidades
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VerUbicaciones;
