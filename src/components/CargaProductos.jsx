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
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [inputActivo, setInputActivo] = useState('codigo'); // 'codigo' o 'cantidad'
  const [mensajeEstado, setMensajeEstado] = useState('');

  const esMobile = /Mobi|Android/i.test(navigator.userAgent);

  useEffect(() => {
    if (inputCodigoRef.current) {
      inputCodigoRef.current.focus();
    }
  }, []);

  const handleCodigoChange = (e) => {
    setCodigoBarras(e.target.value.trim());
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
    if (isNaN(cantidad) || cantidad < 1 || cantidad > 999) {
      setErrorProducto('Cantidad inválida. Debe ser entre 1 y 999.');
      return;
    }
    setCodigoBarras('');
    setCantidad("");
    inputCodigoRef.current?.focus();
    const exito = await handleAgregarProducto(e);
    if (exito) {
      setMensajeEstado('✅ Agregado OK');
      setTimeout(() => setMensajeEstado(''), 2000);
    }

  };

  useEffect(() => {
    if (errorProducto) {
      const timer = setTimeout(() => {
        setErrorProducto('');
      }, 4000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorProducto]);

  const renderTecladoNumerico = () => (
    <div className="teclado-numerico-simulado">
      <div className="fila-teclado">
        {[1, 2, 3].map((n) => (
          <button type="button" key={n} onClick={() => {
            if (inputActivo === 'codigo') {
              setCodigoBarras((prev) => `${prev || ''}${n}`);
            } else {
              setCantidad((prev) => parseInt(`${prev || ''}${n}`));
            }
          }}>{n}</button>
        ))}
      </div>
      <div className="fila-teclado">
        {[4, 5, 6].map((n) => (
          <button type="button" key={n} onClick={() => {
            if (inputActivo === 'codigo') {
              setCodigoBarras((prev) => `${prev || ''}${n}`);
            } else {
              setCantidad((prev) => parseInt(`${prev || ''}${n}`));
            }
          }}>{n}</button>
        ))}
      </div>
      <div className="fila-teclado">
        {[7, 8, 9].map((n) => (
          <button type="button" key={n} onClick={() => {
            if (inputActivo === 'codigo') {
              setCodigoBarras((prev) => `${prev || ''}${n}`);
            } else {
              setCantidad((prev) => parseInt(`${prev || ''}${n}`));
            }
          }}>{n}</button>
        ))}
      </div>
      <div className="fila-teclado">
        <button type="button" onClick={() => {
          if (inputActivo === 'codigo') {
            setCodigoBarras((prev) => prev.slice(0, -1));
          } else {
            setCantidad((prev) => Math.floor(prev / 10));
          }
        }}>←</button>
        <button type="button" onClick={() => {
          if (inputActivo === 'codigo') {
            setCodigoBarras((prev) => `${prev || ''}0`);
          } else {
            setCantidad((prev) => parseInt(`${prev || ''}0`));
          }
        }}>0</button>
        <button type="button" onClick={() => {
          if (inputActivo === 'codigo') {
            setCodigoBarras('');
          } else {
            setCantidad('');
          }
        }}>⟲</button>
      </div>
    </div>
  );


  return (
    <div>
      <div className="ubicacion-actual">
        <h3>

          📍 Ubicación actual: <span> {codigoUbicacion} </span>
        </h3>
        {!mostrarFormulario && (
          <button className="boton-flotante-reabrir cambiar-ubicacion" onClick={() => setMostrarFormulario(true)}>
            📥 Cargar productos
          </button>
        )}
        <button onClick={() => setUbicacionConfirmada(false)} className='cambiar-ubicacion'>
          🔄 Cambiar ubicación
        </button>
      </div>
      <div className="pantalla-carga-producto">
        {mostrarFormulario && (
          <div className="pantalla-carga-producto">
            <button className="cerrar-carga" onClick={() => setMostrarFormulario(false)}>✖</button>
            <form onSubmit={handleAgregarProductoWrapper} className="formulario-carga">
              <label>📦 Escaneá o escribí el código del producto:</label><br />
              <div className='container-agregar'>
                <input
                  type="text"
                  inputMode="text"
                  value={codigoBarras}
                  ref={inputCodigoRef}
                  onFocus={() => setInputActivo('codigo')}
                  onChange={handleCodigoChange}
                  onKeyDown={handleCodigoKeyPress}
                  placeholder="Código de barras"
                  required
                  className="input-codigo"
                  style={{ marginRight: '1rem' }}
                />

                <input
                  type="text"
                  inputMode="text"
                  value={cantidad}
                  onFocus={() => setInputActivo('cantidad')}
                  ref={inputCantidadRef}
                  onChange={(e) => {
                    const soloNumeros = e.target.value.replace(/\D/g, '');
                    setCantidad(parseInt(soloNumeros || ''));
                    setErrorProducto('');
                  }}
                  onKeyDown={handleCantidadKeyPress}
                  required
                  className="input-cantidad"
                  style={{ marginRight: '1rem' }}
                />
                <div className="grupo-boton-agregar">
                  {errorProducto && (<div className='error-teclado'>⚠️ {errorProducto}</div>)}
                  {esMobile && renderTecladoNumerico()}
                  {mensajeEstado
                    ? <div className="agregando">{mensajeEstado}</div>
                    : (enProceso.size > 0 && (
                      <div className="agregando">
                        🕓 Agregando {enProceso.size}...
                      </div>
                    ))
                  }

                  <button type="submit" className="boton-agregar">Agregar</button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {errorProducto && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '0.6rem 1rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb'
        }}>
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
