import React from 'react';
import './MessageList.scss';

const MessageList = () => {
    // Este array simula mensajes para visualización
    const messages = [
        { id: 1, text: "Hola, ¿cómo estás?", sent: false, timestamp: "10:00 AM", status: "read" },
        { id: 2, text: "¡Estoy bien! ¿Y tú?", sent: true, timestamp: "10:02 AM", status: "sent" },
        // Más mensajes...
    ];

    return (
        <div className="message-list">
            {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sent ? 'sent' : 'received'}`}>
                    <div className="message-bubble">
                        <p>{msg.text}</p>
                        <span className="timestamp">{msg.timestamp}</span>
                        <span className={`status ${msg.status}`}>{msg.status}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MessageList;
