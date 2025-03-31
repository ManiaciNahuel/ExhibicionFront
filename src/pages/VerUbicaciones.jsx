import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductoEnUbicacion from '../components/ProductoEnUbicacion';
import ModalEditarCantidad from '../components/ModalEditarCantidad';
import ModalProductoEnOtraUbicacion from '../components/ModalProductoEnOtraUbicacion';

const VerUbicaciones = () => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacionActiva, setUbicacionActiva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productoExistente, setProductoExistente] = useState(null);
  const [mostrarModalCantidad, setMostrarModalCantidad] = useState(false);
  const [productoDuplicado, setProductoDuplicado] = useState(null);
  const [mostrarModalDuplicado, setMostrarModalDuplicado] = useState(false);
  const [ubicacionAnterior, setUbicacionAnterior] = useState('');
  const sucursalId = localStorage.getItem('sucursalId');
  const nombreSucursal = localStorage.getItem('nombreSucursal') || "Sucursal";

  useEffect(() => {
    const fetchUbicaciones = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:3000/ubicaciones/todas?sucursalId=${sucursalId}`);
        const data = res.data.map(u => ({
          ...u,
          productos: u.productos.map(p => ({
            id: p.ProductoUbicacion?.id || p.id,
            nombre: p.nombre || p.Producto || 'Sin nombre',
            codigo: p.codebar,
            cantidad: p.cantidad,
            ubicacion: u.ubicacion
          }))
        }));
        setUbicaciones(data);
      } catch (err) {
        console.error("❌ Error al obtener ubicaciones:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUbicaciones();
  }, [sucursalId]);

  const toggleUbicacion = (codigo) => {
    setUbicacionActiva(prev => (prev === codigo ? null : codigo));
  };

  const handleAgregarUbicacionSiFalta = (nuevoProducto) => {
    const yaExisteUbic = ubicaciones.find(u => u.ubicacion === nuevoProducto.ubicacion);

    if (yaExisteUbic) {
      const actualizadas = ubicaciones.map(u =>
        u.ubicacion === nuevoProducto.ubicacion
          ? { ...u, productos: [...u.productos, nuevoProducto] }
          : u
      );
      setUbicaciones(actualizadas);
    } else {
      setUbicaciones(prev => [
        ...prev,
        {
          ubicacion: nuevoProducto.ubicacion,
          productos: [nuevoProducto]
        }
      ]);
    }
  };

  const handleActualizarCantidad = (id, nuevaCantidad) => {
    const nuevasUbicaciones = ubicaciones.map(u => ({
      ...u,
      productos: u.productos.map(p =>
        p.id === id ? { ...p, cantidad: nuevaCantidad } : p
      )
    }));
    setUbicaciones(nuevasUbicaciones);
  };

  const handleEliminarProducto = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/ubicaciones/${id}`);
      const nuevasUbicaciones = ubicaciones.map(u => ({
        ...u,
        productos: u.productos.filter(p => p.id !== id)
      }));
      setUbicaciones(nuevasUbicaciones);
    } catch (err) {
      console.error("❌ Error al eliminar producto", err);
      alert("Error al eliminar el producto.");
    }
  };

  const handleGuardarDesdeModal = async (id, nuevaCantidad) => {
    try {
      await axios.put(`http://localhost:3000/ubicaciones/${id}`, {
        cantidad: parseInt(nuevaCantidad),
        sucursalId: parseInt(sucursalId)
      });

      setMostrarModalCantidad(false);
      setProductoExistente(null);
      handleActualizarCantidad(id, nuevaCantidad);
    } catch (err) {
      console.error("❌ Error al actualizar cantidad desde modal:", err);
    }
  };

  const handleReubicarProducto = (id, nuevoProducto, nuevaUbicacion) => {
    const nuevasUbicaciones = ubicaciones.map(u => {
      // Eliminar el producto de la ubicación de origen
      if (u.productos.some(p => p.id === id)) {
        return {
          ...u,
          productos: u.productos.filter(p => p.id !== id)
        };
      }

      // Agregar el producto a la nueva ubicación
      if (u.ubicacion === nuevaUbicacion) {
        return {
          ...u,
          productos: [...u.productos, nuevoProducto]
        };
      }

      return u;
    });

    setUbicaciones(nuevasUbicaciones);
  };


  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>📦 Productos exhibidos en {nombreSucursal}</h2>

      {loading ? (
        <div style={{ marginTop: '1rem' }}>⏳ Cargando productos...</div>
      ) : ubicaciones.length === 0 ? (
        <p>No hay productos cargados aún.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {ubicaciones.map((u) => (
            <li key={u.ubicacion} style={{ marginBottom: '1rem' }}>
              <div
                onClick={() => toggleUbicacion(u.ubicacion)}
                style={{
                  backgroundColor: '#f0f0f0',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
              >
                <strong>{u.ubicacion}</strong> – {u.productos.length} producto{u.productos.length !== 1 ? 's' : ''}
              </div>

              {ubicacionActiva === u.ubicacion && (
                <ul style={{ marginTop: '0.5rem' }}>
                  {u.productos.map((p) => (
                    <ProductoEnUbicacion
                      key={p.id}
                      producto={p}
                      onActualizar={handleActualizarCantidad}
                      onEliminar={handleEliminarProducto}
                      onReubicar={handleReubicarProducto}
                      onAgregarUbicacionSiFalta={handleAgregarUbicacionSiFalta} // 👈 esta función nueva
                    />

                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
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
          onConfirmar={() => { }}
          onClose={() => {
            setMostrarModalDuplicado(false);
            setProductoDuplicado(null);
          }}
        />
      )}
    </div>
  );
};

export default VerUbicaciones;
