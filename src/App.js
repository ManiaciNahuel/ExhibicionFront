import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import HomeSucursal from './pages/HomeSucursal';
import HomeAdmin from './pages/HomeAdmin';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/sucursal" element={<HomeSucursal />} />
                <Route path="/admin" element={<HomeAdmin />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
