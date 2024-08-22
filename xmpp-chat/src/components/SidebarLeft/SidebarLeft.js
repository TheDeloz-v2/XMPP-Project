import React, { useState, useEffect } from 'react';
import XmppClientSingleton from "../../xmppClient";
import AddContactModal from './AddContactModal/AddContactModal';
import ContactInfoModal from './ContactInfoModal/ContactInfoModal';
import NonContactsList from './NonContactsList/NonContactsList'; // Importa el nuevo componente
import './SidebarLeft.scss';

const SidebarLeft = ({ xmppClient, onSelectContact }) => {
    const [contacts, setContacts] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [contactStates, setContactStates] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadContacts = async () => {
            const initialContacts = await XmppClientSingleton.getContacts();
            setContacts(initialContacts);
        };

        loadContacts();

        XmppClientSingleton.onUpdateContacts((updatedContacts) => {
            setContacts(updatedContacts);
        });

        const handleIncomingMessage = (message) => {
            const contactJid = message.from.split('/')[0];

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
    }, []);

    const handleSelectContact = (contactJid) => {
        setUnreadCounts(prevCounts => {
            const newCounts = { ...prevCounts };
            delete newCounts[contactJid];
            return newCounts;
        });
        onSelectContact(contactJid);
    };

    const openInfoModal = (contact) => {
        setSelectedContact(contact);
        setIsInfoModalOpen(true);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredContacts = contacts.filter((contact) => {
        return contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="sidebar-left">
            <div className="search-add-section">
                <input
                    type="text"
                    className="search-box"
                    placeholder="Buscar contactos..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <button className="add-contact-btn" onClick={() => setIsAddModalOpen(true)}>+</button>
            </div>
            <div className="contact-list">
                <h3>Contactos</h3>
                {filteredContacts.map((contact) => {
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
                            <button className="info-btn" onClick={(e) => { e.stopPropagation(); openInfoModal(contact); }}>ℹ️</button>
                        </div>
                    );
                })}
            </div>
            <div className="no-contact-list">
                <NonContactsList 
                    contacts={contacts} 
                    onSelectContact={onSelectContact} 
                />
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