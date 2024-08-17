import React from 'react';
import './ChatHeader.scss';

const ChatHeader = ({ contact }) => {
    if (!contact) {
        return null; // Si no hay contacto seleccionado, no mostrar nada
    }

    return (
        <div className="chat-header">
            <div className="contact-info">
                <div className="profile-pic">
                    {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="contact-details">
                    <div className="contact-name">{contact.name}</div>
                    <div className="contact-status">{contact.state === 'online' ? 'En línea' : 'Desconectado'}</div>
                </div>
            </div>
            <div className="chat-options">
                <button className="info-btn">ⓘ</button>
                <button className="mute-btn">🔇</button>
                <button className="block-btn">🚫</button>
            </div>
        </div>
    );
};

export default ChatHeader;

