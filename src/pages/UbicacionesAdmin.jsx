// src/pages/UbicacionesAdmin.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = 'https://exhibicionback-production.up.railway.app';

const UbicacionesAdmin = () => {
    const [nuevaUbicacion, setNuevaUbicacion] = useState({
        idSucursal: '',
        sucursal: '',
        tipo: 'G',
        numeroUbicacion: '',
        division: '',
        numeroDivision: '',
        subdivision: 'E',
        numeroSubdivision: '',
        idCategoria: null
    });
    const [masivo, setMasivo] = useState({
        idSucursal: '',
        sucursal: '',
        tipo: 'G',
        cantidadUbicaciones: 1,
        cantidadSubdivision: 1,
        division: '',
        cantidadDivisiones: 1,
        idCategoria: null
    });
    const [sucursales, setSucursales] = useState([]);

    useEffect(() => {
        axios.get(`${BASE_URL}/sucursales`)
            .then(res => setSucursales(res.data))
            .catch(err => console.error('Error al cargar sucursales', err));
    }, []);

    const handleChange = (e) => {
        setNuevaUbicacion({ ...nuevaUbicacion, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${BASE_URL}/ubicaciones/permitidas`, nuevaUbicacion);
            alert('Ubicación creada correctamente');
        } catch (err) {
            console.error('Error al crear ubicación', err);
            alert('Error al guardar');
        }
    };

    const handleMasivoChange = (e) => {
        setMasivo({ ...masivo, [e.target.name]: e.target.value });
    };

    const handleSubmitMasivo = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${BASE_URL}/ubicaciones/permitidas/masivo`, masivo);
            alert('Ubicaciones creadas masivamente');
        } catch (err) {
            console.error('Error en carga masiva', err);
            alert('Error en carga masiva');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Crear ubicación permitida (individual)</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
                    <label>Tipo de UBIC</label>
                    <select name="tipo" value={nuevaUbicacion.tipo} onChange={handleChange} className="w-full border p-2">
                        <option value="G">Góndola</option>
                        <option value="M">Módulo</option>
                    </select>
                </div>

                <div>
                    <label>Número de ubicación</label>
                    <input type="number" name="numeroUbicacion" value={nuevaUbicacion.numeroUbicacion} onChange={handleChange} className="w-full border p-2" required />
                </div>

                <div>
                    <label>Número de estantes</label>
                    <input type="number" name="numeroSubdivision" value={nuevaUbicacion.numeroSubdivision} onChange={handleChange} className="w-full border p-2" required />
                </div>

                {nuevaUbicacion.tipo === 'G' && (
                    <>
                        <div>
                            <label>Tipo de división</label>
                            <select name="division" value={nuevaUbicacion.division} onChange={handleChange} className="w-full border p-2">
                                <option value="">No corresponde</option>
                                <option value="P">Puntera</option>
                                <option value="L">Lado</option>
                            </select>
                        </div>
                        <div>
                            <label>Número de división</label>
                            <input type="number" name="numeroDivision" value={nuevaUbicacion.numeroDivision} onChange={handleChange} className="w-full border p-2" />
                        </div>
                    </>
                )}

                <div>
                    <label>Categoría (opcional)</label>
                    <input type="number" name="idCategoria" value={nuevaUbicacion.idCategoria || ''} onChange={handleChange} className="w-full border p-2" />
                </div>

                <div className="col-span-2">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Crear ubicación</button>
                </div>
            </form>

            <h2 className="text-xl font-bold mb-4">Carga masiva de ubicaciones</h2>
            <form onSubmit={handleSubmitMasivo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label>Sucursal</label>
                    <select
                        name="idSucursal"
                        value={masivo.idSucursal}
                        onChange={(e) => {
                            const selected = sucursales.find(s => s.id === parseInt(e.target.value));
                            setMasivo({
                                ...masivo,
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
                    <select name="tipo" value={masivo.tipo} onChange={handleMasivoChange} className="w-full border p-2">
                        <option value="G">Góndola</option>
                        <option value="M">Módulo</option>
                    </select>
                </div>

                <div>
                    <label>Cantidad de ubicaciones</label>
                    <input type="number" name="cantidadUbicaciones" value={masivo.cantidadUbicaciones} onChange={handleMasivoChange} className="w-full border p-2" required />
                </div>

                <div>
                    <label>Cantidad de estantes por ubicación</label>
                    <input type="number" name="cantidadSubdivision" value={masivo.cantidadSubdivision} onChange={handleMasivoChange} className="w-full border p-2" required />
                </div>

                {masivo.tipo === 'G' && (
                    <>
                        <div>
                            <label>Tipo de división</label>
                            <select name="division" value={masivo.division} onChange={handleMasivoChange} className="w-full border p-2">
                                <option value="">No corresponde</option>
                                <option value="P">Puntera</option>
                                <option value="L">Lado</option>
                            </select>
                        </div>
                        <div>
                            <label>Cantidad de divisiones por ubicación</label>
                            <input type="number" name="cantidadDivisiones" value={masivo.cantidadDivisiones} onChange={handleMasivoChange} className="w-full border p-2" required />
                        </div>
                    </>
                )}

                <div>
                    <label>Categoría (opcional)</label>
                    <input type="number" name="idCategoria" value={masivo.idCategoria || ''} onChange={handleMasivoChange} className="w-full border p-2" />
                </div>

                <div className="col-span-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Cargar ubicaciones masivamente</button>
                </div>
            </form>
        </div>
    );
};

export default UbicacionesAdmin;
