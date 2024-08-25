import React from 'react';
import './ContactInfoModal.scss';

/**
 * ContactInfoModal component displays the information of a contact in a modal.
 * 
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - Indicates whether the modal is open or not.
 * @param {Object} props.contact - The contact object containing contact details.
 * @param {string} props.contact.jid - The JID (Jabber ID) of the contact.
 * @param {string} props.contact.name - The name of the contact.
 * @param {string} props.contact.state - The state of the contact.
 * @param {Function} props.onClose - The function to close the modal.
 * @param {Function} props.onDeleteContact - The function to delete the contact.
 * @param {Function} props.onToggleStatusSharing - The function to toggle status sharing.
 * @returns {JSX.Element|null} The ContactInfoModal component.
 */
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