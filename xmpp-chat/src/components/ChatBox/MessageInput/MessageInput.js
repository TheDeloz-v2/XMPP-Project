import React, { useState, useEffect } from 'react';
import './MessageInput.scss';

const MessageInput = ({ onSendMessage, replyingTo, onCancelReply }) => {
    const [message, setMessage] = useState("");

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
                    placeholder="Escribe un mensaje..."
                />
                <button onClick={handleSendMessage}>➤</button>
                <button className="attach-btn">📎</button>
                <button className="emoji-btn">😊</button>
            </div>
        </div>
    );
};

export default MessageInput;

