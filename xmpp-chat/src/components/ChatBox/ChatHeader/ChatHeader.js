import React from 'react';
import './ChatHeader.scss';

const ChatHeader = ({ contact }) => {
    if (!contact) {
        return null;
    }

    const contactState = contact.state || 'offline';

    return (
        <div className="chat-header">
            <div className="contact-info">
                <div className={`profile-pic ${contactState}`}>
                    {contact.name.charAt(0).toUpperCase()}
                    <div className="status-indicator"></div>
                </div>
                <div className="contact-details">
                    <div className="contact-name">{contact.name}</div>
                    <div className="contact-status">
                        {contactState === 'available' ? 'En línea' :
                         contactState === 'away' ? 'Ausente' :
                         contactState === 'dnd' ? 'Ocupado' :
                         contactState === 'xa' ? 'No disponible' :
                         'Desconectado'}
                    </div>
                    <div className="status-message">{contact.statusMessage || ''}</div>
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