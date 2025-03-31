import React, { useState } from 'react';
import ProductoEnUbicacion from './ProductoEnUbicacion';

const UbicacionConEstantes = ({ ubicacion, onActualizar, onEliminar, onReubicar, sucursalId }) => {
  const [expandida, setExpandida] = useState(false);

  const handleDescargarTxt = () => {
    const contenido = ubicacion.productos.map(p => `${p.codebar};`).join('\n');
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SA${sucursalId}_Ubic-${ubicacion.ubicacion}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bloque-ubicacion">
      <div className="header-ubicacion" onClick={() => setExpandida(!expandida)}>
        <h3>{ubicacion.ubicacion} ({ubicacion.productos.length} productos)</h3>
        <button>{expandida ? '▲' : '▼'}</button>
      </div>

      {expandida && (
        <>
          <ul>
            {ubicacion.productos.map(p => (
              <ProductoEnUbicacion
                key={p.id}
                producto={p}
                onActualizar={onActualizar}
                onEliminar={onEliminar}
                onReubicar={onReubicar}
              />
            ))}
          </ul>
          <button onClick={handleDescargarTxt} className="descargar-btn">
            📥 Descargar TXT
          </button>
        </>
      )}
    </div>
  );
};

export default UbicacionConEstantes;
