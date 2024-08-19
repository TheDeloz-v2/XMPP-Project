import React, { useState } from 'react';
import './AddContactModal.scss';

const AddContactModal = ({ isOpen, onClose, onAddContact }) => {
    const [xmppAddress, setXmppAddress] = useState("");
    const [message, setMessage] = useState("");
    const [shareStatus, setShareStatus] = useState(false);

    const handleAdd = async () => {
        try {
            await onAddContact(xmppAddress, message, shareStatus);
            onClose();
        } catch (error) {
            console.error('Error al añadir contacto:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Añadir Contacto</h2>
                <input
                    type="text"
                    placeholder="XMPP Address"
                    value={xmppAddress}
                    onChange={(e) => setXmppAddress(e.target.value)}
                />
                <textarea
                    placeholder="Mensaje"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <label>
                    <input
                        type="checkbox"
                        checked={shareStatus}
                        onChange={(e) => setShareStatus(e.target.checked)}
                    />
                    Compartir mi estado
                </label>
                <div className="modal-buttons">
                    <button onClick={handleAdd}>Añadir Contacto</button>
                    <button onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default AddContactModal;
