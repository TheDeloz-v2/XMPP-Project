import React, { useState } from "react";
import XmppClientSingleton from "../../xmppClient";
import { useNavigate } from 'react-router-dom';
import SignUpModal from './SignUpModal/SignUpModal';
import "./SignIn.scss";

const SignIn = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
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

    const handleSignUp = async (newUsername, newPassword) => {
        try {
            await XmppClientSingleton.registerAccount(newUsername, newPassword);
            console.log(`Cuenta ${newUsername} registrada con éxito`);
        } catch (err) {
            throw new Error("Error al registrar la cuenta.");
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

                <p className="register-link">
                    ¿No tienes una cuenta? <span onClick={() => setIsSignUpModalOpen(true)}>Registrarse</span>
                </p>
            </form>
        
            <SignUpModal
                isOpen={isSignUpModalOpen}
                onClose={() => setIsSignUpModalOpen(false)}
                onSignUp={handleSignUp}
            />
        </div>
    );
};

export default SignIn;
