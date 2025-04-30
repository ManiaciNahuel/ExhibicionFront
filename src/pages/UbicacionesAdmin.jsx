// src/pages/UbicacionesAdmin.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UbicacionesAdmin = () => {
    const [ubicaciones, setUbicaciones] = useState([]);
    const [nuevaUbicacion, setNuevaUbicacion] = useState({
        idSucursal: '',
        sucursal: '',
        tipo: 'G',
        numeroUbicacion: '',
        subdivision: 'E',
        numeroSubdivision: '',
        idCategoria: null
    });
    const [sucursales, setSucursales] = useState([]);

    useEffect(() => {
        // Cargar sucursales para el admin
        axios.get('https://exhibicionback-production.up.railway.app/sucursales')
            .then(res => setSucursales(res.data))
            .catch(err => console.error('Error al cargar sucursales', err));
    }, []);

    const handleChange = (e) => {
        setNuevaUbicacion({ ...nuevaUbicacion, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://exhibicionback-production.up.railway.app/ubicaciones/permitidas', nuevaUbicacion);
            alert('Ubicación creada correctamente');
        } catch (err) {
            console.error('Error al crear ubicación', err);
            alert('Error al guardar');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Crear ubicación permitida</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label>Sucursal</label>
                    <select
                        name="idSucursal"
                        value={nuevaUbicacion.idSucursal}
                        onChange={(e) => {
                            const selected = sucursales.find(s => s.id === parseInt(e.target.value));
                            setNuevaUbicacion({
                                ...nuevaUbicacion,
                                idSucursal: selected.id,
                                sucursal: selected.nombre
                            });
                        }}
                        required
                        className="w-full border p-2"
                    >
                        <option value="">Seleccionar...</option>
                        {sucursales.map(s => (
                            <option key={s.id} value={s.id}>{s.nombre}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Tipo</label>
                    <select name="tipo" value={nuevaUbicacion.tipo} onChange={handleChange} className="w-full border p-2">
                        <option value="G">Góndola</option>
                        <option value="M">Módulo</option>
                        <option value="H">Heladera</option>
                        <option value="T">Puntera</option>
                        <option value="X">Camino de caja</option>
                    </select>
                </div>

                <div>
                    <label>Número de ubicación</label>
                    <input type="number" name="numeroUbicacion" value={nuevaUbicacion.numeroUbicacion} onChange={handleChange} className="w-full border p-2" required />
                </div>

                <div>
                    <label>Subdivision</label>
                    <select name="subdivision" value={nuevaUbicacion.subdivision} onChange={handleChange} className="w-full border p-2">
                        <option value="E">Estante</option>
                        <option value="F">Fila</option>
                        <option value="P">Piso</option>
                        <option value="PC">Pecera</option>
                    </select>
                </div>

                <div>
                    <label>Número de subdivision</label>
                    <input type="number" name="numeroSubdivision" value={nuevaUbicacion.numeroSubdivision} onChange={handleChange} className="w-full border p-2" required />
                </div>

                <div>
                    <label>Categoría (opcional)</label>
                    <input type="number" name="idCategoria" value={nuevaUbicacion.idCategoria || ''} onChange={handleChange} className="w-full border p-2" />
                </div>

                <div className="col-span-2">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Crear ubicación</button>
                </div>
            </form>
        </div>
    );
};

export default UbicacionesAdmin;
