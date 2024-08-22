import React, { useState, useEffect } from 'react';
import XmppClientSingleton from "../../../xmppClient";
import './NonContactsList.scss';

const NonContactsList = ({ contacts, onSelectContact }) => {
    const [nonContacts, setNonContacts] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [contactStates, setContactStates] = useState({});

    useEffect(() => {
        const handleIncomingMessage = (message) => {
            const contactJid = message.from.split('/')[0];

            // Verificar si el usuario ya es un contacto o está en la lista de no contactos
            const isAlreadyContact = contacts.some(contact => contact.jid === contactJid);
            const isAlreadyInNonContacts = nonContacts.some(nonContact => nonContact.jid === contactJid);

            if (!isAlreadyContact && !isAlreadyInNonContacts) {
                // Si no es contacto y no está en la lista de no contactos, agregarlo
                const newNonContact = {
                    jid: contactJid,
                    name: contactJid.split('@')[0], // Usar la parte del usuario del JID como nombre
                    state: 'offline', // Estado por defecto
                    statusMessage: '',
                    imageUrl: `https://api.adorable.io/avatars/40/${contactJid}.png`,
                };

                setNonContacts(prevNonContacts => [...prevNonContacts, newNonContact]);
            }

            // Actualizar el contador de mensajes no leídos
            setUnreadCounts(prevCounts => ({
                ...prevCounts,
                [contactJid]: (prevCounts[contactJid] || 0) + 1
            }));
        };

        XmppClientSingleton.onMessage(handleIncomingMessage);

        XmppClientSingleton.onPresenceChange(({ from, status, message }) => {
            setContactStates(prevStates => ({
                ...prevStates,
                [from]: { status, statusMessage: message }
            }));
        });

        return () => {
            XmppClientSingleton.removeMessageHandler(handleIncomingMessage);
        };
    }, [nonContacts, contacts]);

    const handleSelectContact = (contactJid) => {
        setUnreadCounts(prevCounts => {
            const newCounts = { ...prevCounts };
            delete newCounts[contactJid];
            return newCounts;
        });
        onSelectContact(contactJid);
    };

    return (
        <div className="non-contact-list">
            <h3>Usuarios</h3>
            {nonContacts.map((contact) => {
                const contactState = contactStates[contact.jid] || {};
                return (
                    <div
                        key={contact.jid}
                        className="contact-item"
                        onClick={() => handleSelectContact(contact.jid)}
                    >
                        <div className={`avatar ${contactState.status || 'offline'}`}>
                            {contact.name.charAt(0).toUpperCase()}
                            <div className="status-indicator"></div>
                        </div>
                        <div className="contact-info">
                            <div className="name">{contact.name}</div>
                            <div className="status">{contactState.status || 'offline'}</div>
                            <div className="status-message">{contactState.statusMessage || ''}</div>
                        </div>
                        {unreadCounts[contact.jid] > 0 && (
                            <div className="unread-count">
                                {unreadCounts[contact.jid]}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default NonContactsList;
