import React, { useState } from 'react';
import './SignUpModal.scss';

/**
 * SignUpModal component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - Determines if the modal is open or not.
 * @param {Function} props.onClose - The function to close the modal.
 * @param {Function} props.onSignUp - The function to handle the sign up process.
 * @returns {JSX.Element|null} The SignUpModal component.
 */
const SignUpModal = ({ isOpen, onClose, onSignUp }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState("");

    const handleSignUp = async () => {
        try {
            await onSignUp(username, password, email, fullName);
            setUsername("");
            setPassword("");
            setEmail("");
            setFullName("");
            onClose(); // Cierra el modal si la cuenta se crea correctamente
        } catch (err) {
            setError("Error al registrar la cuenta. Inténtalo de nuevo.");
            console.error("Error al registrar la cuenta:", err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Registrarse</h2>
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
                <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Nombre completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
                {error && <p style={{ color: "red" }}>{error}</p>}
                <div className="modal-buttons">
                    <button onClick={handleSignUp}>Registrarse</button>
                    <button onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default SignUpModal;