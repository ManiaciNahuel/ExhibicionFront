import React, { useState } from 'react';
import axios from 'axios';

const HomeSucursal = () => {
    const [codigoUbicacion, setCodigoUbicacion] = useState('');
    const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);

    const [codigoBarras, setCodigoBarras] = useState('');
    const [cantidad, setCantidad] = useState(1);

    const [productosCargados, setProductosCargados] = useState([]);

    const handleConfirmarUbicacion = (e) => {
        e.preventDefault();
        if (!codigoUbicacion.trim()) return;
        setUbicacionConfirmada(true);
    };

    const handleAgregarProducto = async (e) => {
        e.preventDefault();
        if (!codigoUbicacion || !codigoBarras || cantidad < 1) return;

        try {
            const res = await axios.get('http://localhost:3000/productos');
            const producto = res.data.find(p => p.codigoBarras === codigoBarras);

            if (!producto) {
                alert('Producto no encontrado');
                return;
            }

            const tipoUbicacion = codigoUbicacion.match(/^[A-Z]+/)[0];
            const resto = codigoUbicacion.replace(tipoUbicacion, '');
            const numero = parseInt(resto.match(/\d+/)[0]);
            const sub = resto.replace(numero, '') || null;

            await axios.post('http://localhost:3000/ubicaciones', {
                productoId: producto.id,
                tipoUbicacion,
                numeroUbicacion: numero,
                subdivision: sub,
                cantidad: parseInt(cantidad)
            });

            setProductosCargados(prev => [
                ...prev,
                {
                    nombre: producto.nombre,
                    codigo: codigoBarras,
                    cantidad,
                    ubicacion: codigoUbicacion
                }
            ]);

            setCodigoBarras('');
            setCantidad(1);
        } catch (error) {
            console.error(error);
            alert("Error al asignar producto a ubicación");
        }
    };

    const handleNuevaUbicacion = () => {
        setCodigoUbicacion('');
        setUbicacionConfirmada(false);
        setProductosCargados([]);
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h2>📦 Carga de Productos por Ubicación</h2>

            {!ubicacionConfirmada ? (
                <form onSubmit={handleConfirmarUbicacion}>
                    <label>📍 Escaneá o escribí el código de la ubicación:</label>
                    <input
                        type="text"
                        value={codigoUbicacion}
                        onChange={(e) => setCodigoUbicacion(e.target.value.toUpperCase())}
                        placeholder="Ej: G1E3"
                        required
                        autoFocus
                    />
                    <button type="submit">✅ Confirmar Ubicación</button>
                </form>
            ) : (
                <>
                    <div style={{ marginBottom: '1rem' }}>
                        <h3>📍 Ubicación actual: <span style={{ color: 'green' }}>{codigoUbicacion}</span></h3>
                        <button onClick={handleNuevaUbicacion}>🔄 Cambiar ubicación</button>
                    </div>

                    <form onSubmit={handleAgregarProducto}>
                        <label>🔍 Código de barras del producto:</label>
                        <input
                            type="text"
                            value={codigoBarras}
                            onChange={(e) => setCodigoBarras(e.target.value)}
                            required
                            autoFocus
                        />

                        <label>🔢 Cantidad:</label>
                        <input
                            type="number"
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                            min="1"
                            required
                        />

                        <button type="submit">📲 Registrar Producto</button>
                    </form>

                    {productosCargados.length > 0 && (
                        <>
                            <h4 style={{ marginTop: '2rem' }}>✅ Productos cargados en {codigoUbicacion}:</h4>
                            <ul>
                                {productosCargados.map((p, i) => (
                                    <li key={i}>{p.nombre} (x{p.cantidad}) - {p.codigo}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default HomeSucursal;
