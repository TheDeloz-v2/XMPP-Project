import React, { useEffect, useState } from "react";
import { xml } from "@xmpp/client";
import { useNavigate } from 'react-router-dom';
import XmppClientSingleton from "../../xmppClient";
import SidebarLeft from "../SidebarLeft/SidebarLeft";
import ChatBox from "../ChatBox/ChatBox";
import "./MainPage.scss";

const MainPage = () => {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
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
            setContacts(contactList);
        } catch (error) {
            console.error('Error al cargar los contactos:', error);
        }
    };

    return (
        <div className="main-container">
            <SidebarLeft contacts={contacts} xmppClient={xmppClient} />
            <ChatBox />
        </div>
    );
};

export default MainPage;
