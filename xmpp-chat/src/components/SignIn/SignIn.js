import React, { useState } from "react";
import XmppClientSingleton from "../../xmppClient";
import { useNavigate } from 'react-router-dom';
import "./SignIn.scss";

const SignIn = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            const xmppClient = XmppClientSingleton.createClient({ username, password });
            await xmppClient.start();
            console.log(`Usuario ${xmppClient.username} conectado`);
            navigate('/chat');
        } catch (err) {
            setError("Fallo en la conexión o credenciales incorrectas.");
            console.error("Error al iniciar sesión:", err);
        }
    };

    return (
        <div className="sign-in-container">
            <form onSubmit={handleSignIn}>
                <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Iniciar Sesión</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
        </div>
    );
};

export default SignIn;
