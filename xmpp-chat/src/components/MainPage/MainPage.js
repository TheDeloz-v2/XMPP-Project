import React, { useEffect, useState } from "react";
import { xml } from "@xmpp/client";
import { useNavigate } from 'react-router-dom';
import XmppClientSingleton from "../../xmppClient";
import SidebarLeft from "../SidebarLeft/SidebarLeft";
import SidebarRight from "../SidebarRight/SidebarRight";
import ChatBox from "../ChatBox/ChatBox";
import "./MainPage.scss";

const MainPage = () => {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [messages, setMessages] = useState({});
    const xmppClient = XmppClientSingleton.getClient();

    useEffect(() => {
        if (!xmppClient) {
            console.error("XMPP client es null. Redirigiendo a inicio de sesión.");
            navigate('/');
            return;
        }

        const startClientAndLoadContacts = async () => {
            try {
                if (xmppClient.status === 'offline') {
                    await xmppClient.start();
                }
                await xmppClient.send(xml('presence')); // Enviar presencia
                await loadContacts(); // Cargar contactos
            } catch (error) {
                console.error("Error al iniciar el cliente XMPP o enviar presencia:", error);
            }
        };

        startClientAndLoadContacts();
    }, [xmppClient, navigate]);

    const loadContacts = async () => {
        try {
            const contactList = await XmppClientSingleton.getContacts();
            // Asignar un ID único a cada contacto
            const contactsWithIds = contactList.map((contact, index) => ({
                ...contact,
                id: index + 1, // Asignar un ID basado en el índice, puedes cambiar la lógica si lo prefieres
            }));
            setContacts(contactsWithIds);
        } catch (error) {
            console.error('Error al cargar los contactos:', error);
        }
    };

    const handleSelectContact = (contactId) => {
        setSelectedContactId(contactId);
        setMessages(prevMessages => ({
            ...prevMessages,
            [contactId]: prevMessages[contactId] || [], // Asegura que haya un array de mensajes para este contacto
        }));
    };

    const selectedContact = contacts.find(contact => contact.id === selectedContactId);

    return (
        <div className="main-container">
            <SidebarLeft 
                contacts={contacts} 
                xmppClient={xmppClient} 
                onSelectContact={handleSelectContact} 
            />
            <ChatBox 
                selectedContact={selectedContact} 
                messages={messages} 
            />
            <SidebarRight
                xmppClient={xmppClient}
                selectedContactId={selectedContactId}
            />
        </div>
    );
};

export default MainPage;

