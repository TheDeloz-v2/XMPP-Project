import { client, xml } from "@xmpp/client";

const XmppClientSingleton = (() => {
    let xmppClient = null;

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

        return xmppClient;
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
    
    return {
        createClient,
        getClient,
        clearClient,
        getContacts,
        addContact,
        deleteContact,
    };
    
})();

export default XmppClientSingleton;

