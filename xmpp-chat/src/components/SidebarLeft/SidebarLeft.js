import React, { useState, useEffect } from 'react';
import XmppClientSingleton from "../../xmppClient";
import AddContactModal from './AddContactModal/AddContactModal';
import ContactInfoModal from './ContactInfoModal/ContactInfoModal';
import './SidebarLeft.scss';

const SidebarLeft = ({ contacts, xmppClient, onSelectContact }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [contactStates, setContactStates] = useState({});

    useEffect(() => {
        const handleIncomingMessage = (message) => {
            setUnreadCounts(prevCounts => {
                const contactJid = message.from.split('/')[0];
                return {
                    ...prevCounts,
                    [contactJid]: (prevCounts[contactJid] || 0) + 1
                };
            });
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
    }, []);

    const handleSelectContact = (contactId) => {
        setUnreadCounts(prevCounts => {
            const newCounts = { ...prevCounts };
            delete newCounts[contactId];
            return newCounts;
        });
        onSelectContact(contactId);
    };

    const openInfoModal = (contact) => {
        setSelectedContact(contact);
        setIsInfoModalOpen(true);
    };

    return (
        <div className="sidebar-left">
            <div className="search-add-section">
                <input
                    type="text"
                    className="search-box"
                    placeholder="Buscar contactos..."
                />
                <button className="add-contact-btn" onClick={() => setIsAddModalOpen(true)}>+</button>
            </div>
            <div className="contact-list">
                {contacts.map((contact) => {
                    const contactState = contactStates[contact.jid] || {};
                    return (
                        <div
                            key={contact.id} 
                            className="contact-item"
                            onClick={() => handleSelectContact(contact.id)}
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
                            {unreadCounts[contact.id] > 0 && (
                                <div className="unread-count">
                                    {unreadCounts[contact.id]}
                                </div>
                            )}
                            <button className="info-btn" onClick={(e) => { e.stopPropagation(); openInfoModal(contact); }}>ℹ️</button>
                        </div>
                    );
                })}
            </div>
            <AddContactModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddContact={(jid, message, shareStatus) => XmppClientSingleton.addContact(jid, message, shareStatus)}
            />
            <ContactInfoModal
                isOpen={isInfoModalOpen}
                contact={selectedContact}
                onClose={() => setIsInfoModalOpen(false)}
                onDeleteContact={(jid) => XmppClientSingleton.deleteContact(jid)}
            />
        </div>
    );
};

export default SidebarLeft;