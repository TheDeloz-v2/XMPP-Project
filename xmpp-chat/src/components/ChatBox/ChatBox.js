import React from 'react';
import ChatHeader from './ChatHeader/ChatHeader';
import MessageList from './MessageList/MessageList';
import MessageInput from './MessageInput/MessageInput';
import './ChatBox.scss';

const ChatBox = ({ selectedContact, messages }) => {
    if (!selectedContact) {
        return <div className="chatbox">Selecciona un contacto para empezar a chatear</div>;
    }

    return (
        <div className="chatbox">
            <ChatHeader contact={selectedContact} />
            <MessageList messages={messages[selectedContact.id] || []} />
            <MessageInput />
        </div>
    );
};

export default ChatBox;

