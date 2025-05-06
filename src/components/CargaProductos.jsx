import React, { useEffect, useRef, useState } from 'react';
import ProductoEnUbicacion from './ProductoEnUbicacion';
import ModalEditarCantidad from './ModalEditarCantidad';
import ModalProductoEnOtraUbicacion from './ModalProductoEnOtraUbicacion';
import '../styles/CargaProductos.css';

const CargaProductos = ({
  enProceso,
  setEnProceso,
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

  const esMobile = /Mobi|Android/i.test(navigator.userAgent);

  useEffect(() => {
    if (inputCodigoRef.current) {
      inputCodigoRef.current.focus();
    }
  }, []);

  const handleCodigoChange = (e) => {
    const limpio = e.target.value.replace(/^0+/, '');
    setCodigoBarras(limpio);
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
    setCodigoBarras('');
    setCantidad(1);
    inputCodigoRef.current?.focus();
    const exito = await handleAgregarProducto(e);
    setCargando(false);
  };

  useEffect(() => {
    if (errorProducto) {
      const timer = setTimeout(() => {
        setErrorProducto('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorProducto]);

  const renderTecladoNumerico = () => (
    <div className="teclado-numerico">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
        <button key={n} onClick={() => setCantidad((prev) => parseInt(`${prev || ''}${n}`))}>
          {n}
        </button>
      ))}
      <button onClick={() => setCantidad((prev) => Math.floor(prev / 10))}>←</button>
      <button onClick={() => setCantidad(1)}>Reset</button>
    </div>
  );

  return (
    <div>
      <div className="ubicacion-actual">
        <h3>
          📍 Ubicación actual: <span> {codigoUbicacion} </span>
        </h3>
        <button onClick={() => setUbicacionConfirmada(false)} className='cambiar-ubicacion'>
          🔄 Cambiar ubicación
        </button>
      </div>

      <form onSubmit={handleAgregarProductoWrapper} style={{ padding: '1rem 0rem 0rem', borderTop: '3px solid #ccc' }}>
        <label>📦 Escaneá o escribí el código del producto:</label><br />
        <div className='container-agregar'>
          <input
            type="text"
            value={codigoBarras}
            ref={inputCodigoRef}
            onChange={handleCodigoChange}
            onKeyDown={handleCodigoKeyPress}
            placeholder="Código de barras"
            required
            className="input-codigo"
            style={{ marginRight: '1rem' }}
          />

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={cantidad}
            ref={inputCantidadRef}
            onChange={(e) => {
              const soloNumeros = e.target.value.replace(/\D/g, '');
              setCantidad(parseInt(soloNumeros || '1'));
              setErrorProducto('');
            }}
            onKeyDown={handleCantidadKeyPress}
            required
            className="input-cantidad"
            style={{ marginRight: '1rem' }}
          />


          <div className="grupo-boton-agregar">
            <button type="submit" className="boton-agregar">Agregar</button>
            {enProceso.size > 0 && (
              <div className="agregando">
                🕓 Agregando {enProceso.size}...
              </div>
            )}
          </div>
        </div>

        {esMobile && renderTecladoNumerico()}
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
        <ul className='productos-cargados'>
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
