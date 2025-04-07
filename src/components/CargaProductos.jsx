import React, { useEffect, useRef, useState } from 'react';
import ProductoEnUbicacion from './ProductoEnUbicacion';
import ModalEditarCantidad from './ModalEditarCantidad';
import ModalProductoEnOtraUbicacion from './ModalProductoEnOtraUbicacion';

const CargaProductos = ({
  codigoUbicacion,
  setUbicacionConfirmada,
  codigoBarras,
  setCodigoBarras,
  cantidad,
  setCantidad,
  handleAgregarProducto,
  loading,
  productosCargados,
  handleActualizarCantidad,
  handleEliminarProducto,
  handleReubicarProducto,
  mostrarModalCantidad,
  productoExistente,
  handleGuardarDesdeModal,
  mostrarModalDuplicado,
  productoDuplicado,
  ubicacionAnterior,
  handleConfirmarDuplicado,
  setMostrarModalCantidad,
  setMostrarModalDuplicado,
  setProductoDuplicado,
  crearProducto
}) => {
  const inputCodigoRef = useRef(null);
  const inputCantidadRef = useRef(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (inputCodigoRef.current) {
      inputCodigoRef.current.focus();
    }
  }, []);

  const handleDescargarTxt = () => {
    if (!productosCargados || productosCargados.length === 0) {
      alert("No hay productos para descargar.");
      return;
    }
    const lineas = productosCargados.map(p => `${p.codebar || p.codigo || ''};`);
    const contenido = lineas.join('\n');
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${codigoUbicacion}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCodigoChange = (e) => {
    setCodigoBarras(e.target.value);
  };

  const handleCodigoKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputCantidadRef.current?.focus();
    }
  };

  const handleCantidadKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAgregarProductoWrapper(e);
    }
  };

  const handleAgregarProductoWrapper = async (e) => {
    e.preventDefault();
    setCargando(true);
    await handleAgregarProducto(e); // Esta viene como prop desde el padre
    setCargando(false);
    setCodigoBarras('');
    setCantidad(1);
    inputCodigoRef.current?.focus();
  };
  

  return (
    <div>
      <h3>📍 Ubicación actual: <span style={{ color: 'green' }}>{codigoUbicacion}</span></h3>
      <button onClick={() => setUbicacionConfirmada(false)} style={{ marginBottom: '1rem' }}>
        🔄 Cambiar ubicación
      </button>
      <button onClick={handleDescargarTxt} className="descargar-btn">
        📥 Descargar TXT
      </button>

      <form onSubmit={handleAgregarProductoWrapper} style={{ marginBottom: '1rem' }}>

        <label>📦 Escaneá o escribí el código del producto:</label><br />

        <input
          type="text"
          value={codigoBarras}
          ref={inputCodigoRef}
          onChange={handleCodigoChange}
          onKeyDown={handleCodigoKeyPress}
          placeholder="Código de barras"
          required
          style={{ marginRight: '1rem' }}
        />
        <input
          type="number"
          value={cantidad}
          ref={inputCantidadRef}
          onChange={(e) => setCantidad(parseInt(e.target.value))}
          onKeyDown={handleCantidadKeyPress}
          min="1"
          required
          style={{ width: '60px', marginRight: '1rem' }}
        />
        <button type="submit">➕ Agregar</button>
        {cargando && (
          <p style={{ color: 'blue', fontStyle: 'italic', marginTop: '0.5rem' }}>
            ⏳ Agregando producto...
          </p>
        )}

      </form>

      {loading && <p>⏳ Cargando productos...</p>}

      {!loading && productosCargados.length > 0 && (
        <ul style={{ padding: 0 }}>
          {productosCargados.map((p) => (
            <ProductoEnUbicacion
              key={p.id}
              producto={p}
              onActualizar={handleActualizarCantidad}
              onEliminar={handleEliminarProducto}
              onReubicar={handleReubicarProducto}
            />
          ))}
        </ul>
      )}

      {!loading && productosCargados.length === 0 && (
        <div style={{ marginTop: '1rem', backgroundColor: '#e8f0fe', padding: '1rem', borderRadius: '5px' }}>
          ℹ️ No hay productos cargados aún en esta ubicación.
        </div>
      )}

      {mostrarModalCantidad && productoExistente && (
        <ModalEditarCantidad
          producto={productoExistente}
          onClose={() => setMostrarModalCantidad(false)}
          onGuardar={handleGuardarDesdeModal}
        />
      )}

      {mostrarModalDuplicado && productoDuplicado && (
        <ModalProductoEnOtraUbicacion
          producto={productoDuplicado}
          ubicacionAnterior={ubicacionAnterior}
          onConfirmar={handleConfirmarDuplicado}
          onClose={() => {
            setMostrarModalDuplicado(false);
            setProductoDuplicado(null);
          }}
          crearProducto={crearProducto}
        />
      )}
    </div>
  );
};

export default CargaProductos;
