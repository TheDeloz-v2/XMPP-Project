import React, { useState } from 'react';
import './AddContactModal.scss';

const AddContactModal = ({ isOpen, onClose, onAddContact }) => {
    const [xmppAddress, setXmppAddress] = useState('');

    const handleAddContact = async () => {
        try {
            await onAddContact(xmppAddress);
            setXmppAddress(''); // Limpiar el campo de texto
            onClose(); // Cerrar el modal
        } catch (error) {
            console.error('Error al agregar el contacto:', error);
            // Aquí puedes manejar errores y mostrarlos en el modal si es necesario
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Añadir Contacto</h2>
                <input
                    type="text"
                    placeholder="Dirección XMPP"
                    value={xmppAddress}
                    onChange={(e) => setXmppAddress(e.target.value)}
                />
                <div className="modal-buttons">
                    <button onClick={handleAddContact}>Añadir</button>
                    <button onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default AddContactModal;
