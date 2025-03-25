import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ⬅️ Importante

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // ⬅️ Necesitás esto

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const res = await axios.post('http://localhost:3000/auth/login', {
            email,
            password
          });
    
          const usuario = res.data;
          console.log('Respuesta:', res.data);

    
          localStorage.setItem('sucursalId', usuario.sucursalId);
          localStorage.setItem('nombre', usuario.nombre);
          localStorage.setItem('email', usuario.email);
          localStorage.setItem('rol', usuario.rol);
    
          // Setear usuario y redirigir
          onLoginSuccess(usuario);
          navigate('/');
        } catch (err) {
          console.error(err);
          alert('Credenciales incorrectas');
        }
      };
    

    return (
        <div>
            <h2>Login de Sucursal</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                /><br />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                /><br />
                <button type="submit">Iniciar Sesión</button>
            </form>
        </div>
    );
};

export default Login;
