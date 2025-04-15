import React, { useState } from 'react';
import ProductoEnUbicacion from './ProductoEnUbicacion';
import axios from 'axios';
import '../styles/BuscarProductos.css'
import { useNavigate } from 'react-router-dom';

const BuscarProducto = () => {
  const [codigoBarras, setCodigoBarras] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const buscarUbicaciones = async (e = null) => {
    if (e?.preventDefault) e.preventDefault();
    setLoading(true);
    setError('');
    setResultado(null);

    try {
      const sucursalId = localStorage.getItem('sucursalId');

      const ubicacionesRes = await fetch(
        `https://exhibicionback-production.up.railway.app/ubicaciones/producto/${codigoBarras}?sucursalId=${sucursalId}`
      );
      const ubicacionesData = await ubicacionesRes.json();

      if (!Array.isArray(ubicacionesData) || ubicacionesData.length === 0) {
        setResultado({ producto: null, ubicaciones: [] });
        return;
      }

      const productoRes = await fetch(`https://exhibicionback-production.up.railway.app/productos/${codigoBarras}`);
      const producto = await productoRes.json();

      const ubicacionesTransformadas = ubicacionesData.map((ubic) => ({
        id: ubic.id,
        nombre: producto.Producto,
        codplex: producto.CodPlex,
        codigo: codigoBarras,
        cantidad: ubic.cantidad,
        tipo: ubic.tipo,
        numero: ubic.numero,
        subdivision: ubic.subdivision,
        numeroSubdivision: ubic.numeroSubdivision,
        ubicacion: `${ubic.tipo}${ubic.numero}${ubic.subdivision || ''}${ubic.numeroSubdivision || ''}`
      }));

      setResultado({
        producto,
        ubicaciones: ubicacionesTransformadas
      });

    } catch (err) {
      console.error('❌ Error al buscar:', err);
      setError('Ocurrió un error al buscar el producto.');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarProducto = async (id) => {
    try {
      await axios.delete(`https://exhibicionback-production.up.railway.app/ubicaciones/${id}`);
      // 🔁 Refrescamos la lista luego de eliminar
      buscarUbicaciones();
    } catch (err) {
      console.error("❌ Error al eliminar producto:", err);
      alert("No se pudo eliminar el producto");
    }
  };

  const nombreTipo = (tipo) => {
    if (tipo === 'G') return 'Góndola';
    if (tipo === 'M') return 'Módulo';
    if (tipo === 'P') return 'Puntera';
    return tipo;
  };

  const subdivisionTipo = (tipo) => {
    if (tipo === 'E') return 'Estante';
    if (tipo === 'R') return 'Fila de Ranurado';
    return tipo;
  };

  return (
    <div className='buscar-container'>
      <button
        onClick={() => navigate('/carga')}
        className="boton-flotante-inicio"
      >
        📦 Cargar Productos
      </button>

      <h2>🔍 Ubicación de un producto</h2>
      <form onSubmit={buscarUbicaciones}>
        <input
          type="text"
          placeholder="Ingresar código de barras"
          value={codigoBarras}
          onChange={(e) => setCodigoBarras(e.target.value)}
          required
          className='input-buscar'
        />
        <button type="submit" className='buscar-btn'>Buscar</button>
      </form>

      {loading && <p>⏳ Buscando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {resultado && (
        <div style={{ marginTop: '2rem' }}>
          {resultado.producto ? (
            <>
              <h3>Producto: {`${resultado.producto.Producto || ''} ${resultado.producto.Presentaci || ''}`.trim()}</h3>
              <h4>Ubicaciones encontradas:</h4>
              <div>
                {resultado.ubicaciones.map((p, idx) => (
                  <div key={idx} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      📍 {nombreTipo(p.tipo)} {p.numero}
                      {p.subdivision && (
                        <> - {subdivisionTipo(p.subdivision)} {p.numeroSubdivision}</>
                      )}
                    </div>

                    <ProductoEnUbicacion
                      producto={p}
                      onActualizar={() => buscarUbicaciones({ preventDefault: () => { } })}
                      onEliminar={() => handleEliminarProducto(p.id)}
                      onReubicar={() => buscarUbicaciones({ preventDefault: () => { } })}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>⚠️ Producto no encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BuscarProducto;
