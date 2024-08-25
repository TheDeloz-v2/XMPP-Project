import { client, xml } from "@xmpp/client";

/**
 * XmppClientSingleton is a singleton object that provides functionality for managing an XMPP client.
 * It allows creating a client, sending and receiving messages, managing contacts, and handling presence changes.
 * The singleton pattern ensures that only one instance of XmppClientSingleton is created throughout the application.
 *
 * @typedef {Object} XmppClientSingleton
 * @property {function} createClient - Creates an XMPP client with the provided username and password.
 * @property {function} onUpdateContacts - Registers a handler for updating the contacts list.
 * @property {function} sendMessage - Sends a message to the specified recipient.
 * @property {function} onMessage - Registers a handler for incoming messages.
 * @property {function} removeMessageHandler - Removes a handler for incoming messages.
 * @property {function} getClient - Retrieves the XMPP client instance.
 * @property {function} clearClient - Clears the XMPP client instance and removes stored credentials.
 * @property {function} getContacts - Retrieves the list of contacts.
 * @property {function} onPresenceChange - Registers a handler for presence changes.
 * @property {function} onGroupInvite - Registers a handler for group chat invitations.
 * @property {function} addContact - Sends a subscription request to add a new contact.
 * @property {function} deleteContact - Removes a contact from the roster.
 * @property {function} registerAccount - Registers a new XMPP account with the provided credentials.
 * @property {function} sendPresence - Sends a presence stanza with the specified status and message.
 * @property {function} onToggleStatusSharing - Toggles the sharing of status information with a contact.
 * @property {function} sendGroupMessage - Sends a message to a group chat.
 * @property {function} joinGroup - Joins a group chat with the specified nickname.
 * @property {function} getJoinedGroups - Retrieves the list of joined group chats.
 * @property {function} deleteAccount - Deletes the XMPP account from the server.
 * @property {function} onPresenceRequest - Registers a handler for presence subscription requests.
 * @property {function} acceptPresenceRequest - Accepts a presence subscription request.
 * @property {function} declinePresenceRequest - Declines a presence subscription request.
 * @property {function} leaveGroup - Leaves a group chat.
 * @property {function} createGroup - Creates a new group chat with the specified settings.
 * @property {function} inviteToGroup - Invites a user to join a group chat.
 * 
 */

const XmppClientSingleton = (() => {
    let xmppClient = null;
    let messageHandlers = [];
    let contacts = [];

    const createClient = ({ username, password }) => {
        xmppClient = client({
            service: "ws://alumchat.lol:7070/ws/",
            domain: "alumchat.lol",
            resource: "example",
            username: username,
            password: password,
        });

        xmppClient.username = username;

        // Save the credentials in localStorage
        localStorage.setItem('xmppClientCredentials', JSON.stringify({ username, password }));

        // Configure the event to handle incoming messages
        xmppClient.on('stanza', handleIncomingMessage);

        return xmppClient;
    };

    // Handlers for updating contacts, group chat invitations, and presence requests
    let updateContactsHandler = null;
    let inviteHandler = null;
    let presenceRequestHandler = null;

    const handleIncomingMessage = (stanza) => {

        console.log(stanza);
        if (stanza.is('message')) {
            const type = stanza.attrs.type;
            const from = stanza.attrs.from.split('/')[0];
            let body = stanza.getChildText('body');
            const message = { from, body, timestamp: new Date() };
    
            // Check if it is a Group Chat invitation
            const xElement = stanza.getChild('x', 'jabber:x:conference');
            if (xElement) {
                const groupJid = xElement.attrs.jid;
                console.log(`Invitación recibida para unirse al grupo: ${groupJid} enviada por ${from}`);
    
                if (inviteHandler) {
                    inviteHandler({ from, groupJid });
                }
                return;
            }
    
            // Check if it is a Group Chat message
            if (type === 'groupchat') {
                console.log(`Mensaje de grupo recibido de ${from}: ${body}`);
                message.isGroupMessage = true;
                messageHandlers.forEach(handler => handler(message));

                // Ignore group messages from the current user
                if (from !== stanza.attrs.from.split('/')[0]) {
                    messageHandlers.forEach(handler => handler(message));
                }
            } else if (type === 'chat') {
                console.log(`Mensaje individual recibido de ${from}: ${body}`);
                messageHandlers.forEach(handler => handler(message));
            }
    
            // Check if it is a file message
            if (body && body.startsWith('FILE_BASE64:')) {
                const base64Content = body.replace('FILE_BASE64:', '');
                const decodedContent = atob(base64Content);
                message.body = `Archivo recibido:\n${decodedContent}`;
            }
    
            // Update the contacts list if the sender is not in the roster
            if (!contacts.find(contact => contact.jid === from)) {
                
                // Add the new contact to the list
                contacts.push({
                    jid: from,
                    name: from.split('@')[0],
                    state: 'offline', // Default state, will be updated with presence messages
                    isSharingMyStatus: false,
                    isSharingTheirStatus: false,
                    statusMessage: '',
                    imageUrl: `https://api.adorable.io/avatars/40/${from}.png`,
                    isNotInContactList: true // Flag to indicate that the contact is not in the roster
                });
    
                // Update the contacts list
                if (updateContactsHandler) {
                    updateContactsHandler([...contacts]);
                }
            }
    
        }
        // Handle presence subscription requests
        if (stanza.is('presence') && stanza.attrs.type === 'subscribe') {
            const from = stanza.attrs.from;
            console.log(`Solicitud de presencia recibida de ${from}`);
            
            if (presenceRequestHandler) {
                presenceRequestHandler({ from });
            }
        }
    };    

    const onUpdateContacts = (handler) => {
        updateContactsHandler = handler;
    };

    const sendMessage = (to, body) => {
        // Create a message stanza and send it to the recipient
        const messageStanza = xml(
            'message',
            { to, type: 'chat' },
            xml('body', {}, body)
        );

        xmppClient.send(messageStanza).then(() => {
            console.log(`Mensaje enviado a ${to}: ${body}`);
        }).catch(err => {
            console.error('Error al enviar mensaje:', err);
        });
    };

    const onMessage = (handler) => {
        // Register a message handler
        messageHandlers.push(handler);
    };

    const removeMessageHandler = (handler) => {
        // Remove a message handler
        messageHandlers = messageHandlers.filter(h => h !== handler);
    };

    const getClient = () => {
        if (!xmppClient) {
            // Try to create a client using stored credentials
            const storedCredentials = localStorage.getItem('xmppClientCredentials');
            if (storedCredentials) {
                const { username, password } = JSON.parse(storedCredentials);
                xmppClient = createClient({ username, password });
            }
        }
        return xmppClient;
    };

    const clearClient = () => {
        xmppClient = null;
        localStorage.removeItem('xmppClientCredentials');
    };

    const getContacts = () => {
        // Retrieve the roster from the server and update the contacts list
        return new Promise((resolve, reject) => {
            const rosterIq = xml(
                'iq',
                { type: 'get', id: 'roster1' },
                xml('query', { xmlns: 'jabber:iq:roster' })
            );
    
            const handleRosterResponse = stanza => {
                if (stanza.is('iq') && stanza.getChild('query')) {
                    const items = stanza.getChild('query').getChildren('item');
                    contacts = items.map(item => ({
                        jid: item.attrs.jid,
                        name: item.attrs.name || item.attrs.jid.split('@')[0],
                        state: 'offline', // Default state, will be updated with presence messages
                        isSharingMyStatus: false,
                        isSharingTheirStatus: false,
                        statusMessage: '', // Default status message
                        imageUrl: `https://api.adorable.io/avatars/40/${item.attrs.jid}.png`
                    }));
                    xmppClient.removeListener('stanza', handleRosterResponse);
                    resolve(contacts);
                }
            };
    
            xmppClient.on('stanza', handleRosterResponse);
    
            xmppClient.send(rosterIq).catch((err) => {
                xmppClient.removeListener('stanza', handleRosterResponse);
                console.error('Error al obtener los contactos:', err);
                reject(err);
            });
        });
    };
    
    const onPresenceChange = (callback) => {
        if (!xmppClient) return;
    
        // Handle incoming presence stanzas
        xmppClient.on('stanza', (stanza) => {
            if (stanza.is('presence')) {
                const from = stanza.attrs.from.split('/')[0];
                const status = stanza.getChildText('show') || 'available';
                const message = stanza.getChildText('status') || '';
                
                // Update the contact's status and status message
                contacts = contacts.map(contact => 
                    contact.jid === from 
                    ? { ...contact, state: status, statusMessage: message, isSharingTheirStatus: true }
                    : contact
                );

                callback({ from, status, message });
            }
        });
    };    

    const onGroupInvite = (handler) => {
        inviteHandler = handler;
    };

    const addContact = (jid, message, shareStatus) => {
        return new Promise((resolve, reject) => {
            // Send a subscription request to add the contact
            const subscribeIq = xml(
                'presence',
                { to: jid, type: 'subscribe' },
                xml('status', {}, message)
            );

            xmppClient.send(subscribeIq).then(() => {
                if (shareStatus) {
                    sendPresence('available', 'Comparto mi estado');
                    contacts = contacts.map(contact =>
                        contact.jid === jid 
                        ? { ...contact, isSharingMyStatus: true } 
                        : contact
                    );
                }
                console.log(`Solicitud de suscripción enviada a ${jid}`);
                resolve();
            }).catch((err) => {
                console.error('Error al añadir el contacto:', err);
                reject(err);
            });
        });
    };

    const deleteContact = (jid) => {
        return new Promise((resolve, reject) => {
            // Send an unsubscribe request to remove the contact
            const unsubscribeIq = xml(
                'iq',
                { type: 'set', id: 'unsub1' },
                xml('query', { xmlns: 'jabber:iq:roster' },
                    xml('item', { jid, subscription: 'remove' })
                )
            );
    
            xmppClient.send(unsubscribeIq).then(() => {
                contacts = contacts.filter(contact => contact.jid !== jid);
                console.log(`El contacto ${jid} ha sido eliminado.`);
                resolve();
            }).catch((err) => {
                console.error('Error al eliminar el contacto:', err);
                reject(err);
            });
        });
    };
    
    // Register a new account with the provided credentials. The server only allows registration from an existing account.
    const registerAccount = async (newUsername, newPassword, email = "", fullName = "") => {
        try {
            // Create a new client with the root account to register the new account
            const rootClient = client({
                service: "ws://alumchat.lol:7070/ws/",
                domain: "alumchat.lol",
                username: "lem21469-root",
                password: "lem21469-rootpassword",
            });

            rootClient.on('status', status => {
                console.log(`XMPP root client status: ${status}`);
            });

            await rootClient.start();

            // Send the registration IQ to create the new account
            const registrationIQ = xml(
                'iq',
                { type: 'set', id: 'reg1' },
                xml('query', { xmlns: 'jabber:iq:register' },
                    xml('username', {}, newUsername),
                    xml('password', {}, newPassword),
                    email ? xml('email', {}, email) : null,
                    fullName ? xml('name', {}, fullName) : null
                )
            );

            const result = await rootClient.send(registrationIQ);
            console.log('Resultado del registro:', result);

            // Stop the root client after registration
            await rootClient.stop();

            return result;
        } catch (error) {
            console.error('Error al registrar la cuenta:', error);
            throw new Error("Error al registrar la cuenta.");
        }
    };

    const sendPresence = (status, message = "") => {
        if (!xmppClient) return;

        // Create a presence stanza with the specified status and message
        const presence = xml(
            'presence',
            {},
            xml('show', {}, status),
            xml('status', {}, message)
        );

        xmppClient.send(presence);
    };

    const onToggleStatusSharing = (jid, type) => {
        // Toggle the sharing of status information with the contact
        contacts = contacts.map(contact =>
            contact.jid === jid 
            ? { ...contact, [type === 'myStatus' ? 'isSharingMyStatus' : 'isSharingTheirStatus']: !contact[type === 'myStatus' ? 'isSharingMyStatus' : 'isSharingTheirStatus'] } 
            : contact
        );

        if (type === 'myStatus') {
            if (contacts.find(contact => contact.jid === jid).isSharingMyStatus) {
                sendPresence('available', 'Comparto mi estado');
            } else {
                sendPresence('unavailable', 'Dejo de compartir mi estado');
            }
        }
    };

    const deleteAccount = async () => {
        try {
            // Send an IQ to delete the account from the server
            const iq = xml(
                'iq',
                { type: 'set', id: 'delete1' },
                xml('query', { xmlns: 'jabber:iq:register' },
                    xml('remove')
                )
            );
            await xmppClient.send(iq);
            console.log('Cuenta eliminada del servidor.');
            
        } catch (error) {
            console.error('Error al eliminar la cuenta:', error);
        }
    };    

    const sendGroupMessage = (roomJid, message) => {
        // Create a message stanza and send it to the group chat
        const messageStanza = xml(
            'message',
            { to: roomJid, type: 'groupchat' },
            xml('body', {}, message)
        );

        xmppClient.send(messageStanza).then(() => {
            console.log(`Mensaje enviado a la sala ${roomJid}: ${message}`);
        }).catch(err => {
            console.error('Error al enviar el mensaje al grupo:', err);
        });
    };

    const joinGroup = (roomJid, nickname) => {
        // Send a presence stanza to join the group chat with the specified nickname
        const presence = xml(
            'presence',
            { to: `${roomJid}/${nickname}` },
            xml('x', { xmlns: 'http://jabber.org/protocol/muc' })
        );

        xmppClient.send(presence).then(() => {
            console.log(`Unido a la sala: ${roomJid} con el apodo: ${nickname}`);
        }).catch(err => {
            console.error('Error al unirse a la sala:', err);
        });
    };

    const getJoinedGroups = () => {
        return new Promise((resolve, reject) => {
            // Send a disco#items IQ to get the list of joined group chats
            const discoItemsIq = xml(
                'iq',
                { from: xmppClient.jid, type: 'get', id: 'disco1', to: xmppClient.jid.domain },
                xml('query', { xmlns: 'http://jabber.org/protocol/disco#items' })
            );
    
            xmppClient.send(discoItemsIq).then(response => {
                const items = response.getChild('query', 'http://jabber.org/protocol/disco#items').getChildren('item');
                const groups = items
                    .filter(item => item.attrs.jid.includes('conference')) // Filter by conference JIDs
                    .map(item => ({ jid: item.attrs.jid, name: item.attrs.name }));
                resolve(groups);
            }).catch(err => {
                console.error('Error al obtener los grupos:', err);
                reject(err);
            });
        });
    };

    const onPresenceRequest = (handler) => {
        presenceRequestHandler = handler;
    };
    
    const acceptPresenceRequest = (requester) => {
        // Send a presence stanza to accept the subscription request
        const presenceStanza = xml(
            'presence',
            { to: requester, type: 'subscribed' }
        );
    
        xmppClient.send(presenceStanza).then(() => {
            console.log(`Solicitud de presencia aceptada para ${requester}`);
        }).catch(err => {
            console.error('Error al aceptar la solicitud de presencia:', err);
        });
    };
    
    const declinePresenceRequest = (requester) => {
        // Send a presence stanza to decline the subscription request
        const presenceStanza = xml(
            'presence',
            { to: requester, type: 'unsubscribed' }
        );
    
        xmppClient.send(presenceStanza).then(() => {
            console.log(`Solicitud de presencia rechazada para ${requester}`);
        }).catch(err => {
            console.error('Error al rechazar la solicitud de presencia:', err);
        });
    };

    const leaveGroup = (roomJid) => {
        // Send an unavailable presence stanza to leave the group chat
        const presenceStanza = xml(
            'presence',
            { to: roomJid, type: 'unavailable' }
        );
    
        xmppClient.send(presenceStanza).then(() => {
            console.log(`Saliste del grupo: ${roomJid}`);
        }).catch(err => {
            console.error('Error al salir del grupo:', err);
        });
    };

    const createGroup = async ({ name, description = '', isPrivate = false, address }) => {
        try {
            const roomJid = address;
    
            // Send a presence stanza to create the group chat
            const presence = xml(
                'presence',
                { to: `${roomJid}/${xmppClient.username}` },
                xml('x', { xmlns: 'http://jabber.org/protocol/muc' })
            );
    
            await xmppClient.send(presence);
            console.log(`Grupo creado con JID: ${roomJid}`);
    
            // Configure the group chat settings
            const iq = xml(
                'iq',
                { to: roomJid, type: 'set' },
                xml('query', { xmlns: 'http://jabber.org/protocol/muc#owner' },
                    xml('x', { xmlns: 'jabber:x:data', type: 'submit' },
                        xml('field', { var: 'FORM_TYPE', type: 'hidden' },
                            xml('value', {}, 'http://jabber.org/protocol/muc#roomconfig')
                        ),
                        xml('field', { var: 'muc#roomconfig_roomname' },
                            xml('value', {}, name)
                        ),
                        xml('field', { var: 'muc#roomconfig_roomdesc' },
                            xml('value', {}, description)
                        ),
                        xml('field', { var: 'muc#roomconfig_publicroom' },
                            xml('value', {}, isPrivate ? '0' : '1')
                        ),
                        xml('field', { var: 'muc#roomconfig_persistentroom' },
                            xml('value', {}, '1')
                        ),
                        xml('field', { var: 'muc#roomconfig_membersonly' },
                            xml('value', {}, isPrivate ? '1' : '0')
                        )
                    )
                )
            );
    
            await xmppClient.send(iq);
            console.log(`Grupo configurado: ${name}, privado: ${isPrivate}`);
    
            return roomJid;
        } catch (error) {
            console.error('Error al crear el grupo:', error);
            throw error;
        }
    };    
    
    const inviteToGroup = async (groupJid, inviteeJid, reason = '') => {
        // Send an invitation message to the invitee to join the group chat
        try {
            const messageStanza = xml(
                'message',
                { to: groupJid },
                xml('x', { xmlns: 'http://jabber.org/protocol/muc#user' },
                    xml('invite', { to: inviteeJid },
                        reason ? xml('reason', {}, reason) : null
                    )
                )
            );
    
            await xmppClient.send(messageStanza);
            console.log(`Invitación enviada a ${inviteeJid} para unirse al grupo ${groupJid}`);
        } catch (error) {
            console.error('Error al invitar al usuario al grupo:', error);
            throw error;
        }
    };    

    return {
        createClient,
        getClient,
        clearClient,
        getContacts,
        addContact,
        deleteContact,
        registerAccount,
        sendMessage,
        onMessage,
        removeMessageHandler,
        sendPresence,
        onPresenceChange,
        onToggleStatusSharing,
        sendGroupMessage,
        joinGroup,
        onGroupInvite,
        getJoinedGroups,
        deleteAccount,
        onUpdateContacts,
        onPresenceRequest,
        acceptPresenceRequest,
        declinePresenceRequest,
        leaveGroup,
        createGroup,
        inviteToGroup,
    };
})();

export default XmppClientSingleton;
