import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Login.css'; // ⬅️ Importamos estilos
import logo from '../assets/Logo blanco_Mesa de trabajo 1 copia.png'; // ⬅️ Ruta al logo

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:3000/login', { email, password });
      const { sucursalId } = res.data;
      localStorage.setItem('sucursalId', sucursalId);
      onLogin();
    } catch (err) {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="Farmacias Sanchez Antoniolli" className="login-logo" />
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
          <button type="submit">Iniciar Sesión</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
