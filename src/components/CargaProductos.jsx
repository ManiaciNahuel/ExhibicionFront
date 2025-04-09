import React, { useEffect, useRef, useState } from 'react';
import ProductoEnUbicacion from './ProductoEnUbicacion';
import ModalEditarCantidad from './ModalEditarCantidad';
import ModalProductoEnOtraUbicacion from './ModalProductoEnOtraUbicacion';
import '../styles/CargaProductos.css'

const CargaProductos = ({
  errorProducto,
  setErrorProducto,
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
      <button onClick={() => setUbicacionConfirmada(false)} style={{ marginBottom: '1rem' }} className='cambiar-ubicacion'>
        🔄 Cambiar ubicación
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
          onChange={(e) => {
            setCantidad(parseInt(e.target.value));
            setErrorProducto('')
          }}
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
      {errorProducto && (
        <div
          style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '0.6rem 1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            border: '1px solid #f5c6cb'
          }}
        >
          ⚠️ {errorProducto}
        </div>
      )}


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
