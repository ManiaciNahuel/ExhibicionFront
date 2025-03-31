
import React from 'react';
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
}) => (
  <div>
    <h3>📍 Ubicación actual: <span style={{ color: 'green' }}>{codigoUbicacion}</span></h3>
    <button onClick={() => setUbicacionConfirmada(false)} style={{ marginBottom: '1rem' }}>
      🔄 Cambiar ubicación
    </button>

    <form onSubmit={handleAgregarProducto} style={{ marginBottom: '1rem' }}>
      <label>📦 Escaneá o escribí el código del producto:</label><br />
      <input
        type="text"
        value={codigoBarras}
        onChange={(e) => setCodigoBarras(e.target.value)}
        placeholder="Código de barras"
        required
        style={{ marginRight: '1rem' }}
      />
      <input
        type="number"
        value={cantidad}
        onChange={(e) => setCantidad(parseInt(e.target.value))}
        min="1"
        required
        style={{ width: '60px', marginRight: '1rem' }}
      />
      <button type="submit">➕ Agregar</button>
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

export default CargaProductos;
