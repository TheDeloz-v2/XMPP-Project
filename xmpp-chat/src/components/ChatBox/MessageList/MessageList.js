import React from 'react';
import './MessageList.scss';

const MessageList = ({ messages }) => {
    return (
        <div className="message-list">
            {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sent ? 'sent' : 'received'}`}>
                    <div className="message-bubble">
                        <p>{msg.body}</p>
                        <span className="timestamp">{msg.timestamp}</span>
                        <span className={`status ${msg.status}`}>{msg.status}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MessageList;


