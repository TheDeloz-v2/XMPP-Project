import React, { useEffect, useState } from "react";
import { xml } from "@xmpp/client";
import { useNavigate } from 'react-router-dom';
import XmppClientSingleton from "../../xmppClient";
import SidebarLeft from "../SidebarLeft/SidebarLeft";
import SidebarRight from "../SidebarRight/SidebarRight";
import ChatBox from "../ChatBox/ChatBox";
import GroupInviteModal from "../GroupInviteModal/GroupInviteModal";
import PresenceRequestModal from "../PresenceRequestModal/PresenceRequestModal";
import "./MainPage.scss";

/**
 * The MainPage component represents the main page of the XMPP chat application.
 * It handles the rendering of the main container, sidebar, chat box, and modals.
 * The component also manages the state for selected contact, messages, group invites, and presence requests.
 * It interacts with the XmppClientSingleton to handle XMPP client operations.
 *
 * @returns {JSX.Element} The rendered MainPage component.
 */
const MainPage = () => {
    const navigate = useNavigate();
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [messages, setMessages] = useState({});
    const [groupInvite, setGroupInvite] = useState(null);
    const [presenceRequest, setPresenceRequest] = useState(null);
    const [groups, setGroups] = useState([]);
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
                await xmppClient.send(xml('presence'));
            } catch (error) {
                console.error("Error al iniciar el cliente XMPP o enviar presencia:", error);
            }
        };

        startClient();

        XmppClientSingleton.onGroupInvite(({ from, groupJid }) => {
            setGroupInvite({ from, groupJid });
        });

        XmppClientSingleton.onPresenceRequest(({ from }) => {
            setPresenceRequest(from);
        });

        XmppClientSingleton.onMessage((message) => {
            console.log("Mensaje recibido:", message);

            setMessages(prevMessages => {
                const updatedMessages = {
                    ...prevMessages,
                    [message.from]: [...(prevMessages[message.from] || []), message]
                };
                console.log("Mensajes actualizados:", updatedMessages);
                return updatedMessages;
            });
        });

    }, [xmppClient, navigate]);

    const handleSelectContact = (contactJid) => {
        setSelectedContactId(contactJid);
        setMessages(prevMessages => ({
            ...prevMessages,
            [contactJid]: prevMessages[contactJid] || [],
        }));
    };    

    const handleJoinGroup = (groupJid) => {
        XmppClientSingleton.joinGroup(groupJid, XmppClientSingleton.getClient().username);
        setGroups(prevGroups => [...prevGroups, { jid: groupJid, messages: [] }]);
        setGroupInvite(null);
    };

    const handleDeclineGroup = () => {
        setGroupInvite(null);
    };

    const handleAcceptPresenceRequest = (requester) => {
        XmppClientSingleton.acceptPresenceRequest(requester);
        setPresenceRequest(null);
    };

    const handleDeclinePresenceRequest = (requester) => {
        XmppClientSingleton.declinePresenceRequest(requester);
        setPresenceRequest(null);
    };

    const selectedContact = selectedContactId 
        ? {
            jid: selectedContactId,
            name: selectedContactId.split('@')[0], 
        } 
        : null;

    return (
        <div className="main-container">
            <SidebarLeft 
                xmppClient={xmppClient} 
                onSelectContact={handleSelectContact} 
                groups={groups}
                setGroups={setGroups}
            />
            <ChatBox 
                selectedContact={selectedContact} 
                messages={messages[selectedContactId] || []} 
            />
            <SidebarRight
                xmppClient={xmppClient}
                selectedContactId={selectedContactId}
            />
            {groupInvite && (
                <GroupInviteModal
                    groupJid={groupInvite.groupJid}
                    inviter={groupInvite.from}
                    onJoin={handleJoinGroup}
                    onDecline={handleDeclineGroup}
                />
            )}
            {presenceRequest && (
                <PresenceRequestModal
                    requester={presenceRequest}
                    onAccept={handleAcceptPresenceRequest}
                    onDecline={handleDeclinePresenceRequest}
                />
            )}
        </div>
    );
};

export default MainPage;