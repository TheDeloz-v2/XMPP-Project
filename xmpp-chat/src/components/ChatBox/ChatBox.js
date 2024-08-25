import React, { useState, useEffect } from 'react';
import ChatHeader from './ChatHeader/ChatHeader';
import MessageList from './MessageList/MessageList';
import MessageInput from './MessageInput/MessageInput';
import XmppClientSingleton from '../../xmppClient';
import './ChatBox.scss';

/**
 * ChatBox component.
 * 
 * @param {Object} props - The component props.
 * @param {Object} props.selectedContact - The selected contact object.
 * @returns {JSX.Element} The rendered ChatBox component.
 */
const ChatBox = ({ selectedContact }) => {
    const [messages, setMessages] = useState({});
    const [replyingTo, setReplyingTo] = useState(null);
    const [contactStates, setContactStates] = useState({});

    useEffect(() => {
        const handleIncomingMessage = (message) => {
            setMessages(prevMessages => {
                const contactJid = message.from.split('/')[0];
                const contactMessages = prevMessages[contactJid] || [];

                if (message.body === null) {
                    const updatedMessages = contactMessages.map(msg => ({
                        ...msg,
                        status: 'seen',
                    }));
                    return {
                        ...prevMessages,
                        [contactJid]: updatedMessages,
                    };
                }

                const isReply = message.body.startsWith('>');
                let newMessage = { body: message.body, sent: false, timestamp: new Date().toLocaleTimeString(), status: 'received' };

                if (isReply) {
                    const [original, reply] = message.body.split('\n');
                    newMessage = {
                        ...newMessage,
                        body: reply,
                        replyTo: original.replace('>', '').trim(),
                    };
                }

                return {
                    ...prevMessages,
                    [contactJid]: [...contactMessages, newMessage],
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

    const handleSendMessage = (message, replyTo = null) => {
        const formattedMessage = replyTo ? `> ${replyTo}\n${message}` : message;
        XmppClientSingleton.sendMessage(selectedContact.jid, formattedMessage);
        setMessages(prevMessages => {
            const contactMessages = prevMessages[selectedContact.jid] || [];
            return {
                ...prevMessages,
                [selectedContact.jid]: [
                    ...contactMessages,
                    { body: message, sent: true, timestamp: new Date().toLocaleTimeString(), status: 'sent', replyTo },
                ],
            };
        });
        setReplyingTo(null);
    };

    const handleSendFile = (base64File, fileName) => {
        if (selectedContact) {
            const fileMessage = `[Archivo enviado: ${fileName}]`;
    
            setMessages(prevMessages => {
                const currentMessages = prevMessages[selectedContact.jid] || [];
                return {
                    ...prevMessages,
                    [selectedContact.jid]: [
                        ...currentMessages,
                        { from: 'me', body: fileMessage, timestamp: new Date(), sent: true }
                    ]
                };
            });
    
            // Send the file to the selected contact
            XmppClientSingleton.sendMessage(selectedContact.jid, base64File);
        }
    };    

    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    if (!selectedContact) {
        return <div className="chatbox">Selecciona un contacto para empezar a chatear</div>;
    }

    const contactState = contactStates[selectedContact.jid] || {};

    return (
        <div className="chatbox">
            <ChatHeader contact={{ ...selectedContact, state: contactState.status, statusMessage: contactState.statusMessage }} />
            <MessageList 
                messages={messages[selectedContact.jid] || []}
                onReply={(msg) => {
                    setReplyingTo(msg);
                }}
            />
            <MessageInput 
                onSendMessage={handleSendMessage} 
                replyingTo={replyingTo} 
                onCancelReply={handleCancelReply}
                onSendFile={handleSendFile}
            />
        </div>
    );
};

export default ChatBox;