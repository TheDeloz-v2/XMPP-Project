import React from 'react';

const ChatBox = () => {
    return (
        <div className="chat-box">
            <div className="chat-header">Chat Header</div>
            <div className="chat-messages">Messages</div>
            <div className="chat-input">
                <input type="text" placeholder="Type message..." />
                <button>Send</button>
            </div>
        </div>
    );
};

export default ChatBox;
