import React, { useEffect, useRef } from 'react';
import './MessageList.scss';

const MessageList = ({ messages, onReply }) => {
    const messageEndRef = useRef(null);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleDownloadFile = (base64Data, fileName) => {
        const blob = new Blob([base64Data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="message-list">
            {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sent ? 'sent' : 'received'}`}>
                    <div className="message-bubble">
                        {msg.body.startsWith('FILE_BASE64:') ? (
                            <div>
                                <p>Archivo recibido: {msg.body.split(':')[2]}</p> {/* Nombre del archivo */}
                                <button 
                                    onClick={() => handleDownloadFile(atob(msg.body.split(':')[1]), msg.body.split(':')[2])}>
                                    Descargar archivo
                                </button>
                            </div>
                        ) : (
                            <p>{msg.body}</p>
                        )}
                        <span className="timestamp">
                            {msg.timestamp instanceof Date 
                                ? msg.timestamp.toLocaleString() 
                                : msg.timestamp}
                        </span>
                        <span className={`status ${msg.status}`}>{msg.status}</span>
                        <button onClick={() => onReply(msg.body)} className="reply-btn">↩️</button>
                    </div>
                </div>
            ))}
            <div ref={messageEndRef} />
        </div>
    );
};

export default MessageList;
