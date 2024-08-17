import React, { useState } from 'react';
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
                        onClick={() => onSelectContact(contact.id)}
                    >
                        <div className={`avatar ${contact.state === 'online' ? 'online' : ''}`}>
                            {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="contact-info">
                            <div className="name">{contact.name}</div>
                            <div className="status">{contact.state}</div>
                        </div>
                        <button className="info-btn" onClick={(e) => { e.stopPropagation(); openInfoModal(contact); }}>ℹ️</button>
                    </div>
                ))}
            </div>
            <div className="profile-logout-section">
                <div className="profile-info">
                    <div className="avatar">{xmppClient.username.charAt(0).toUpperCase()}</div>
                    <div>{xmppClient.username}</div>
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
