import React, { useState, useEffect } from 'react';
import XmppClientSingleton from "../../xmppClient";
import AddContactModal from './AddContactModal/AddContactModal';
import ContactInfoModal from './ContactInfoModal/ContactInfoModal';
import GroupInfoModal from './GroupInfoModal/GroupInfoModal';
import CreateGroupModal from '../CreateGroupModal/CreateGroupModal'; 
import './SidebarLeft.scss';

const SidebarLeft = ({ xmppClient, onSelectContact, groups, setGroups }) => {
    const [contacts, setContacts] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [contactStates, setContactStates] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

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

                if (message) {
                    const contactJid = message.from.split('/')[0];

                    setUnreadCounts(prevCounts => ({
                        ...prevCounts,
                        [contactJid]: (prevCounts[contactJid] || 0) + 1
                    }));
                }
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

    const openGroupInfoModal = (group) => {
        setSelectedGroup(group);
        setIsInfoModalOpen(true);
    };

    const handleLeaveGroup = (groupJid) => {
        XmppClientSingleton.leaveGroup(groupJid);
        setGroups(prevGroups => prevGroups.filter(group => group.jid !== groupJid));
        setSelectedGroup(null);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleCreateGroup = async (groupData) => {
        try {
            const roomJid = await XmppClientSingleton.createGroup(groupData);
            XmppClientSingleton.joinGroup(roomJid, XmppClientSingleton.getClient().username);
            setGroups(prevGroups => [...prevGroups, { jid: roomJid, messages: [] }]);
        } catch (error) {
            console.error('Error al crear el grupo:', error);
        }
    };

    const handleInviteToGroup = async (groupJid, inviteeJid, reason) => {
        try {
            await XmppClientSingleton.inviteToGroup(groupJid, inviteeJid, reason);
        } catch (error) {
            console.error('Error al invitar al usuario al grupo:', error);
        }
    }

    const filteredContacts = contacts.filter((contact) => {
        return contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const filteredGroups = groups.filter((group) => {
        return group.jid.toLowerCase().includes(searchTerm.toLowerCase());
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
                <button className="create-group-btn" onClick={() => setIsCreateGroupModalOpen(true)}>Crear Grupo</button>
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
                                <div className="status">
                                    {contactState.status === 'dnd' && 'Ocupado'}
                                    {contactState.status === 'away' && 'Ausente'}
                                    {contactState.status === 'available' && 'En línea'}
                                    {contactState.status === 'xa' && 'No disponible'}
                                    {!contactState.status && 'Desconectado'}
                                </div>
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
                <h3>Grupos</h3>
                {filteredGroups.map((group) => (
                    <div
                        key={group.jid}
                        className="contact-item"
                        onClick={() => handleSelectContact(group.jid)} // Maneja la selección del grupo
                    >
                        <div className="contact-info">
                            <div className="name">{group.jid.split('@')[0]}</div>
                        </div>                        
                        <button className="info-btn" onClick={(e) => { e.stopPropagation(); openGroupInfoModal(group); }}>ℹ️</button>
                    </div>
                ))}
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
            {selectedGroup && (
                <GroupInfoModal
                    isOpen={isInfoModalOpen}
                    group={selectedGroup}
                    onClose={() => setIsInfoModalOpen(false)}
                    onLeaveGroup={handleLeaveGroup}
                    onInvite={handleInviteToGroup}
                />
            )}
            <CreateGroupModal
                isOpen={isCreateGroupModalOpen}
                onClose={() => setIsCreateGroupModalOpen(false)}
                onCreateGroup={handleCreateGroup}
            />
        </div>
    );
};

export default SidebarLeft;
