import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductoPorSucursal.css';

const ProductoPorSucursal = () => {
    const [codebar, setCodebar] = useState('');
    const [resultados, setResultados] = useState([]);
    const navigate = useNavigate();


    const buscar = async () => {
        try {
            const res = await fetch(`https://exhibicionback-production.up.railway.app/ubicaciones/compras/producto/${codebar}`);
            const data = await res.json();
            setResultados(data);
        } catch (err) {
            console.error('❌ Error al buscar producto:', err);
        }
    };

    return (
        <div className="producto-container">
            <button
                onClick={() => navigate('/sucursal-completa')}
                className="boton boton-flotante-compras"
            >
                🔎 Ver sucursales
            </button>
            <h1>Buscar Producto por Sucursal</h1>
            <div className="busqueda">
                <input
                    type="text"
                    value={codebar}
                    onChange={(e) => setCodebar(e.target.value)}
                    placeholder="Escaneá o escribí el código de barras"
                />
                <button onClick={buscar} className="boton">Buscar</button>
            </div>

            {resultados.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Sucursal</th>
                            <th>Ubicación</th>
                            <th>Cantidad</th>
                            <th>Tipo</th>
                            <th>División</th>
                            <th>Subdivisión</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resultados.map((r, i) => (
                            <tr key={i}>
                                <td>{r.sucursal}</td>
                                <td>{r.ubicacion}</td>
                                <td>{r.cantidad}</td>
                                <td>{r.tipo}{r.numero}</td>
                                <td>{r.division}{r.numeroDivision || ''}</td>
                                <td>{r.subdivision}{r.numeroSubdivision}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ProductoPorSucursal;
