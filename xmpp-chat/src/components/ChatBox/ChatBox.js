import React, { useState, useEffect } from 'react';
import ChatHeader from './ChatHeader/ChatHeader';
import MessageList from './MessageList/MessageList';
import MessageInput from './MessageInput/MessageInput';
import XmppClientSingleton from '../../xmppClient';
import './ChatBox.scss';

const ChatBox = ({ selectedContact }) => {
    const [messages, setMessages] = useState({}); // Estado para manejar los mensajes de todas las conversaciones
    const [contactStates, setContactStates] = useState({});

    useEffect(() => {
        const handleIncomingMessage = (message) => {
            setMessages(prevMessages => {
                const contactJid = message.from.split('/')[0];
                const contactMessages = prevMessages[contactJid] || [];
                return {
                    ...prevMessages,
                    [contactJid]: [...contactMessages, { body: message.body, sent: false, timestamp: new Date().toLocaleTimeString(), status: 'received' }]
                };
            });
        };

        const handlePresenceChange = ({ from, status, message }) => {
            setContactStates(prevStates => ({
                ...prevStates,
                [from]: { status, statusMessage: message }
            }));
        };

        XmppClientSingleton.onMessage(handleIncomingMessage);
        XmppClientSingleton.onPresenceChange(handlePresenceChange);

        return () => {
            XmppClientSingleton.removeMessageHandler(handleIncomingMessage);
        };
    }, []);

    const handleSendMessage = (message) => {
        XmppClientSingleton.sendMessage(selectedContact.jid, message);
        setMessages(prevMessages => {
            const contactMessages = prevMessages[selectedContact.jid] || [];
            return {
                ...prevMessages,
                [selectedContact.jid]: [
                    ...contactMessages,
                    { body: message, sent: true, timestamp: new Date().toLocaleTimeString(), status: 'sent' }
                ]
            };
        });
    };

    if (!selectedContact) {
        return <div className="chatbox">Selecciona un contacto para empezar a chatear</div>;
    }

    const contactState = contactStates[selectedContact.jid] || {};

    return (
        <div className="chatbox">
            <ChatHeader contact={{ ...selectedContact, state: contactState.status, statusMessage: contactState.statusMessage }} />
            <MessageList messages={messages[selectedContact.jid] || []} />
            <MessageInput onSendMessage={handleSendMessage} />
        </div>
    );
};

export default ChatBox;