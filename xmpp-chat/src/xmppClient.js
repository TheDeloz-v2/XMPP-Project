import { client, xml } from "@xmpp/client";

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

        // Guardar las credenciales en localStorage
        localStorage.setItem('xmppClientCredentials', JSON.stringify({ username, password }));

        // Configurar el evento para manejar mensajes entrantes
        xmppClient.on('stanza', handleIncomingMessage);

        return xmppClient;
    };

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
    
            // Verificar si es una invitación a un Group Chat
            const xElement = stanza.getChild('x', 'jabber:x:conference');
            if (xElement) {
                const groupJid = xElement.attrs.jid;
                console.log(`Invitación recibida para unirse al grupo: ${groupJid} enviada por ${from}`);
    
                if (inviteHandler) {
                    inviteHandler({ from, groupJid });
                }
                return; // Salir de la función para que no se procese como un mensaje regular
            }
    
            // Procesamiento de mensajes normales o de grupo
            if (type === 'groupchat') {
                console.log(`Mensaje de grupo recibido de ${from}: ${body}`);
                message.isGroupMessage = true;
                messageHandlers.forEach(handler => handler(message));

                // Evitar el procesamiento del propio mensaje en el cliente que lo envió
                if (from !== stanza.attrs.from.split('/')[0]) {
                    messageHandlers.forEach(handler => handler(message));
                }
            } else if (type === 'chat') {
                console.log(`Mensaje individual recibido de ${from}: ${body}`);
                messageHandlers.forEach(handler => handler(message));
            }
    
            // Verificar si el mensaje contiene un archivo en base64
            if (body && body.startsWith('FILE_BASE64:')) {
                const base64Content = body.replace('FILE_BASE64:', '');
                const decodedContent = atob(base64Content);
                message.body = `Archivo recibido:\n${decodedContent}`;
            }
    
            // Manejo de contactos
            if (!contacts.find(contact => contact.jid === from)) {
                // Si no existe, agregar el contacto
                contacts.push({
                    jid: from,
                    name: from.split('@')[0], // Usar la parte del usuario del JID como nombre
                    state: 'offline', // Estado por defecto, se actualizará con los mensajes de presencia
                    isSharingMyStatus: false,
                    isSharingTheirStatus: false,
                    statusMessage: '',
                    imageUrl: `https://api.adorable.io/avatars/40/${from}.png`,
                    isNotInContactList: true // Indicador de que no está en la lista de contactos
                });
    
                // Actualizar la lista de contactos
                if (updateContactsHandler) {
                    updateContactsHandler([...contacts]);
                }
            }
    
        }
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
        // Registrar un nuevo handler para los mensajes
        messageHandlers.push(handler);
    };

    const removeMessageHandler = (handler) => {
        // Eliminar un handler de mensajes
        messageHandlers = messageHandlers.filter(h => h !== handler);
    };

    const getClient = () => {
        if (!xmppClient) {
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
                        state: 'offline', // Estado por defecto, se actualizará con los mensajes de presencia
                        isSharingMyStatus: false,
                        isSharingTheirStatus: false,
                        statusMessage: '', // Mensaje de estado por defecto
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
    
        xmppClient.on('stanza', (stanza) => {
            if (stanza.is('presence')) {
                const from = stanza.attrs.from.split('/')[0]; // Obtener solo el JID base
                const status = stanza.getChildText('show') || 'available';
                const message = stanza.getChildText('status') || '';
                
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
    
    const registerAccount = async (newUsername, newPassword, email = "", fullName = "") => {
        try {
            // Conectarse con la cuenta root
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

            // Enviar solicitud de registro para la nueva cuenta
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

            await rootClient.stop(); // Desconectarse de la cuenta root

            return result;
        } catch (error) {
            console.error('Error al registrar la cuenta:', error);
            throw new Error("Error al registrar la cuenta.");
        }
    };

    const sendPresence = (status, message = "") => {
        if (!xmppClient) return;

        const presence = xml(
            'presence',
            {},
            xml('show', {}, status),
            xml('status', {}, message)
        );

        xmppClient.send(presence);
    };

    const onToggleStatusSharing = (jid, type) => {
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
            const discoItemsIq = xml(
                'iq',
                { from: xmppClient.jid, type: 'get', id: 'disco1', to: xmppClient.jid.domain },
                xml('query', { xmlns: 'http://jabber.org/protocol/disco#items' })
            );
    
            xmppClient.send(discoItemsIq).then(response => {
                const items = response.getChild('query', 'http://jabber.org/protocol/disco#items').getChildren('item');
                const groups = items
                    .filter(item => item.attrs.jid.includes('conference')) // Filtrar solo los elementos que son grupos
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
    
            // Enviar presencia inicial para crear la sala
            const presence = xml(
                'presence',
                { to: `${roomJid}/${xmppClient.username}` },
                xml('x', { xmlns: 'http://jabber.org/protocol/muc' })
            );
    
            await xmppClient.send(presence);
            console.log(`Grupo creado con JID: ${roomJid}`);
    
            // Configurar la sala (nombre, descripción, privacidad)
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
