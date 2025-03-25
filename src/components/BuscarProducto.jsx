import React, { useState } from 'react';

const BuscarProducto = () => {
  const [codebar, setCodebar] = useState('');
  const [producto, setProducto] = useState(null);
  const [error, setError] = useState('');

  const buscarProducto = async () => {
    setProducto(null);
    setError('');

    try {
      const res = await fetch(`http://localhost:3000/productos/${codebar}`);
      if (!res.ok) throw new Error('Producto no encontrado');
      const data = await res.json();
      setProducto(data);
    } catch (err) {
      setError('❌ Producto no encontrado');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') buscarProducto();
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto' }}>
      <h2>Buscar producto</h2>
      <input
        type="text"
        value={codebar}
        onChange={(e) => setCodebar(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Escaneá o escribí el código"
        style={{ padding: '10px', width: '100%', fontSize: '1rem' }}
      />
      <button onClick={buscarProducto} style={{ marginTop: 10 }}>Buscar</button>

      {producto && (
        <div style={{ marginTop: 20, background: '#f0f0f0', padding: 15 }}>
          <h4>✅ Producto encontrado</h4>
          <p><strong>ID:</strong> {producto.CodPlex}</p>
          <p><strong>Nombre:</strong> {producto.Producto}</p>
          <p><strong>Presentación:</strong> {producto.Presentaci}</p>
          <p><strong>Precio:</strong> ${producto.Precio}</p>
          <p><strong>Costo:</strong> ${producto.Costo}</p>
          <p><strong>Activo:</strong> {producto.Activo}</p>
        </div>
      )}

      {error && <div style={{ color: 'red', marginTop: 20 }}>{error}</div>}
    </div>
  );
};

export default BuscarProducto;
