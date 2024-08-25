import React from 'react';
import './ContactInfoModal.scss';

const ContactInfoModal = ({ isOpen, contact, onClose, onDeleteContact, onToggleStatusSharing }) => {
    const handleDelete = async () => {
        try {
            await onDeleteContact(contact.jid);
            onClose(); 
        } catch (error) {
            console.error('Error al eliminar el contacto:', error);
        }
    };

    if (!isOpen || !contact) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Información del Contacto</h2>
                <p><strong>JID:</strong> {contact.jid}</p>
                <p><strong>Nombre:</strong> {contact.name}</p>
                <p><strong>Estado:</strong> {contact.state}</p>
                {/*}
                <p>
                    <strong>¿Comparto mi estado?:</strong> 
                    <input 
                        type="checkbox" 
                        checked={contact.isSharingMyStatus} 
                        onChange={() => handleToggleSharing('myStatus')} 
                    />
                </p>
                <p>
                    <strong>¿Me comparte su estado?:</strong> 
                    <input 
                        type="checkbox" 
                        checked={contact.isSharingTheirStatus} 
                        disabled
                    />
                </p>
                {*/}
                <div className="modal-buttons">
                    <button onClick={handleDelete}>Eliminar Contacto</button>
                    <button onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default ContactInfoModal;
