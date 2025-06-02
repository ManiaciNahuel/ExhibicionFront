import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/PanelCompras.css';

const PanelCompras = () => {
    return (
        <div className="panel-compras">
            <h1>Panel de Compras</h1>
            <p>Seleccioná una de las opciones para comenzar:</p>
            <div className="opciones">
                <Link to="/producto-por-sucursal">
                    🔍 Buscar un producto y ver en qué sucursales está
                </Link>
                <Link to="/sucursal-completa">
                    🏬 Ver todas las ubicaciones y productos de una sucursal
                </Link>
            </div>
        </div>
    );
};

export default PanelCompras;
