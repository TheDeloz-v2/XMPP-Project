import { client, xml } from "@xmpp/client";

const XmppClientSingleton = (() => {
    let xmppClient = null;
    let messageHandlers = [];

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

    const handleIncomingMessage = (stanza) => {
        if (stanza.is('message') && stanza.attrs.type === 'chat') {
            const from = stanza.attrs.from;
            const body = stanza.getChildText('body');
            const message = { from, body, timestamp: new Date() };

            console.log(`Mensaje recibido de ${from}: ${body}`);

            // Llamar a todos los handlers registrados
            messageHandlers.forEach(handler => handler(message));
        }
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
                    const contacts = items.map(item => ({
                        jid: item.attrs.jid,
                        name: item.attrs.name || item.attrs.jid.split('@')[0],
                        state: 'offline', // Estado por defecto, se actualizará con los mensajes de presencia
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
                callback({ from, status, message });
            }
        });
    };    

    const addContact = (jid) => {
        return new Promise((resolve, reject) => {
            const subscribeIq = xml(
                'presence',
                { to: jid, type: 'subscribe' }
            );

            xmppClient.send(subscribeIq).then(() => {
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
    };
})();

export default XmppClientSingleton;
