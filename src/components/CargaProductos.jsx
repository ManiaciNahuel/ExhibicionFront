import React, { useEffect, useRef, useState } from 'react';
import ProductoEnUbicacion from './ProductoEnUbicacion';
import ModalEditarCantidad from './ModalEditarCantidad';
import ModalProductoEnOtraUbicacion from './ModalProductoEnOtraUbicacion';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/browser';



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
  const [estadoScanner, setEstadoScanner] = useState('');

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

  const videoRef = useRef(null);

  const [zoomActivo, setZoomActivo] = useState(true);

  const toggleZoom = () => {
    setZoomActivo(prev => !prev);
  };

  useEffect(() => {
    if (!codigoUbicacion) return;

    const codeReader = new BrowserMultiFormatReader();

    setEstadoScanner('🎥 Iniciando cámara...');

    codeReader.decodeFromVideoDevice(
      null,
      videoRef.current,
      (result, err) => {
        if (result) {
          const texto = result.getText();
          console.log(`✅ Código detectado: ${texto}`);
          setCodigoBarras(texto);
          setEstadoScanner(`✅ Código detectado: ${texto}`);
          codeReader.reset(); // para frenar la lectura
        }
      },
      {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          advanced: [{ zoom: 2 }]
        }
      }
    ).catch((err) => {
      console.error("❌ Error al iniciar escáner:", err);
      setEstadoScanner('❌ Error al iniciar cámara');
    });

    return () => {
      try {
        codeReader.reset();
      } catch (err) {
        console.warn("⚠️ Error al detener el escáner:", err.message);
      }
    };
  }, [codigoUbicacion]);



  return (
    <div>
      <h3>📍 Ubicación actual: <span style={{ color: 'green' }}>{codigoUbicacion}</span></h3>
      <button onClick={() => setUbicacionConfirmada(false)} style={{ marginBottom: '1rem' }}>
        🔄 Cambiar ubicación
      </button>
      <button onClick={handleDescargarTxt} className="descargar-btn">
        📥 Descargar TXT
      </button>

      <form onSubmit={handleAgregarProducto} style={{ marginBottom: '1rem' }}>
        <label>📦 Escaneá o escribí el código del producto:</label><br />

        {codigoUbicacion && (
          <>
            <p style={{ fontStyle: 'italic', margin: '0.5rem 0' }}>{estadoScanner}</p>
            <div style={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
              <div
                style={{
                  width: "100%",
                  height: "240px",
                  marginBottom: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <video
                  ref={videoRef}
                  id="zxing-scanner"
                  style={{
                    width: "100%",
                    height: "240px",
                    marginBottom: "1rem",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    overflow: "hidden",
                    objectFit: "cover",
                    transform: zoomActivo ? "scale(2.2)" : "scale(1)",
                    transformOrigin: "center"
                  }}
                />
                {/* Overlay guía visual */}
                <div style={{
                  position: "absolute",
                  border: "2px dashed #00ff00",
                  top: "25%",
                  left: "20%",
                  width: "60%",
                  height: "50%",
                  pointerEvents: "none",
                  zIndex: 10
                }} />
              </div>
            </div>


            {codigoBarras && (
              <div style={{ marginBottom: '1rem', color: 'green' }}>
                ✅ Último código detectado: <strong>{codigoBarras}</strong>
              </div>
            )}
          </>
        )}

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
};

export default CargaProductos;
