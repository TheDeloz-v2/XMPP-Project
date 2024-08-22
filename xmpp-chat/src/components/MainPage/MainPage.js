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
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [messages, setMessages] = useState({});
    const xmppClient = XmppClientSingleton.getClient();

    useEffect(() => {
        if (!xmppClient) {
            console.error("XMPP client es null. Redirigiendo a inicio de sesión.");
            navigate('/');
            return;
        }

        const startClient = async () => {
            try {
                if (xmppClient.status === 'offline') {
                    await xmppClient.start();
                }
                await xmppClient.send(xml('presence')); // Enviar presencia
            } catch (error) {
                console.error("Error al iniciar el cliente XMPP o enviar presencia:", error);
            }
        };

        startClient();
    }, [xmppClient, navigate]);

    const handleSelectContact = (contactJid) => {
        setSelectedContactId(contactJid);
        setMessages(prevMessages => ({
            ...prevMessages,
            [contactJid]: prevMessages[contactJid] || [], // Asegura que haya un array de mensajes para este contacto
        }));
    };

    const selectedContact = selectedContactId 
        ? {
            jid: selectedContactId,
            name: selectedContactId.split('@')[0], // Usa la parte del usuario del JID como nombre
        } 
        : null;

    return (
        <div className="main-container">
            <SidebarLeft 
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


