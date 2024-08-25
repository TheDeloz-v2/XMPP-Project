import React, { useState, useEffect } from 'react';
import './MessageInput.scss';

const MessageInput = ({ onSendMessage, replyingTo, onCancelReply, onSendFile }) => {
    const [message, setMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (replyingTo) {
            setMessage(``);
        }
    }, [replyingTo]);

    const handleSendMessage = () => {
        if (message.trim()) {
            onSendMessage(message, replyingTo);
            setMessage("");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "text/plain") {
            setSelectedFile(file);
        } else {
            alert("Por favor selecciona un archivo .txt");
        }
    };

    const handleSendFile = () => {
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const base64 = event.target.result.split(',')[1];
                const prefixedBase64 = `FILE_BASE64:${base64}`;
                onSendFile(prefixedBase64, selectedFile.name);
                setSelectedFile(null);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    return (
        <div className="message-input-container">
            {replyingTo && (
                <div className="replying-indicator">
                    <span>Replying to: {replyingTo}</span>
                    <button onClick={onCancelReply} className="cancel-reply-btn">✖</button>
                </div>
            )}
            <div className="message-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleSendMessage();
                        }
                    }}
                    placeholder="Escribe un mensaje..."
                />
                <button onClick={handleSendMessage}>➤</button>
                <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    id="file-input"
                />
                <label htmlFor="file-input" className="file-input">📎</label>
                {selectedFile && (
                    <button onClick={handleSendFile} className="send-file-btn">Enviar {selectedFile.name}</button>
                )}
            </div>
        </div>
    );
};

export default MessageInput;