import React, { useState } from 'react';
import './MessageInput.scss';

const MessageInput = ({ onSendMessage }) => {
    const [message, setMessage] = useState("");

    const handleSendMessage = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage("");
        }
    };

    return (
        <div className="message-input">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
            />
            <button onClick={handleSendMessage}>➤</button>
            <button className="attach-btn">📎</button>
            <button className="emoji-btn">😊</button>
        </div>
    );
};

export default MessageInput;

