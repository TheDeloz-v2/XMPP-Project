import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import XmppClientSingleton from "../../xmppClient";
import AddContactModal from './AddContactModal/AddContactModal';
import ContactInfoModal from './ContactInfoModal/ContactInfoModal';
import './SidebarLeft.scss';

const SidebarLeft = ({ contacts, xmppClient, onSelectContact }) => {
    const navigate = useNavigate();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [presenceStatus, setPresenceStatus] = useState("available");
    const [statusMessage, setStatusMessage] = useState("");
    const [unreadCounts, setUnreadCounts] = useState({}); // Estado para contar los mensajes no leídos

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

        return () => {
            XmppClientSingleton.removeMessageHandler(handleIncomingMessage);
        };
    }, []);

    const handleSelectContact = (contactId) => {
        // Resetear el contador de mensajes no leídos cuando se selecciona un contacto
        setUnreadCounts(prevCounts => {
            const newCounts = { ...prevCounts };
            delete newCounts[contactId];
            return newCounts;
        });
        onSelectContact(contactId);
    };

    const handleLogOut = async (e) => {
        e.preventDefault();
        try {
            if (xmppClient) {
                await xmppClient.stop();
                XmppClientSingleton.clearClient();
                console.log(`User session ${xmppClient.username} closed`);
                navigate('/');
            }
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const handlePresenceChange = (status) => {
        setPresenceStatus(status);
        XmppClientSingleton.sendPresence(status, statusMessage);
    };

    const handleStatusMessageChange = (message) => {
        setStatusMessage(message);
        XmppClientSingleton.sendPresence(presenceStatus, message);
    };

    const handleAddContact = async (xmppAddress) => {
        try {
            await XmppClientSingleton.addContact(xmppAddress);
            const updatedContacts = await XmppClientSingleton.getContacts();
            onSelectContact(updatedContacts);
        } catch (error) {
            console.error('Error al añadir contacto:', error);
        }
    };

    const handleDeleteContact = async (jid) => {
        try {
            await XmppClientSingleton.deleteContact(jid);
            const updatedContacts = await XmppClientSingleton.getContacts();
            onSelectContact(updatedContacts);
        } catch (error) {
            console.error('Error al eliminar contacto:', error);
        }
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
                {contacts.map((contact) => (
                    <div
                        key={contact.id} 
                        className="contact-item"
                        onClick={() => handleSelectContact(contact.id)}
                    >
                        <div className={`avatar ${contact.state}`}>
                            {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="contact-info">
                            <div className="name">{contact.name}</div>
                            <div className="status">{contact.state}</div>
                        </div>
                        {unreadCounts[contact.id] > 0 && (
                            <div className="unread-count">
                                {unreadCounts[contact.id]}
                            </div>
                        )}
                        <button className="info-btn" onClick={(e) => { e.stopPropagation(); openInfoModal(contact); }}>ℹ️</button>
                    </div>
                ))}
            </div>
            <div className="profile-logout-section">
                <div className="profile-info">
                    <div className={`avatar ${presenceStatus}`}>
                        {xmppClient.username.charAt(0).toUpperCase()}
                        <div className="status-indicator"></div>
                    </div>
                    <div>{xmppClient.username}</div>
                    <select
                        value={presenceStatus}
                        onChange={(e) => handlePresenceChange(e.target.value)}
                    >
                        <option value="available">Available</option>
                        <option value="away">Away</option>
                        <option value="dnd">Busy</option>
                        <option value="xa">Not Available</option>
                        <option value="offline">Offline</option>
                    </select>
                    <input
                        type="text"
                        value={statusMessage}
                        onChange={(e) => handleStatusMessageChange(e.target.value)}
                        placeholder="Status message..."
                    />
                </div>
                <button onClick={handleLogOut}>Log Out</button>
            </div>
            <AddContactModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddContact={handleAddContact}
            />
            <ContactInfoModal
                isOpen={isInfoModalOpen}
                contact={selectedContact}
                onClose={() => setIsInfoModalOpen(false)}
                onDeleteContact={handleDeleteContact}
            />
        </div>
    );
};

export default SidebarLeft;
