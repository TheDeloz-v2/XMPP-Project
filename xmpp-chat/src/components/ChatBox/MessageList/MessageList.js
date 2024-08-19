import React, { useEffect, useRef } from 'react';
import './MessageList.scss';

const MessageList = ({ messages, onReply }) => {
    const messageEndRef = useRef(null);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="message-list">
            {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sent ? 'sent' : 'received'}`}>
                    <div className="message-bubble">
                        {msg.replyTo && <blockquote>{msg.replyTo}</blockquote>}
                        <p>{msg.body}</p>
                        <span className="timestamp">{msg.timestamp}</span>
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
