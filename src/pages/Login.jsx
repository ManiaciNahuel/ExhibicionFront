import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Login.css';
import logo from '../assets/Logo blanco_Mesa de trabajo 1 copia.png';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setCargando(true);
    try {
      const res = await axios.post('exhibicionback-production.up.railway.app/auth/login', {
        email,
        password,
      });

      const { id, nombre, email: correo, rol, sucursalId, sucursal } = res.data;

      localStorage.setItem('id', id);
      localStorage.setItem('nombre', nombre);
      localStorage.setItem('email', correo);
      localStorage.setItem('rol', rol);
      localStorage.setItem('sucursalId', sucursalId);
      localStorage.setItem('nombreSucursal', sucursal);

      console.log('✅ Login exitoso, datos:', res.data);

      onLoginSuccess(res.data);
      navigate('/');
    } catch (err) {
      console.error('❌ Error en login:', err);
      alert('Credenciales incorrectas');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="Farmacias Sánchez Antoniolli" className="login-logo" />
      <div className="login-box">
        <h2>Login de Sucursal</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            placeholder="Correo"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            value={password}
            placeholder="Contraseña"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
