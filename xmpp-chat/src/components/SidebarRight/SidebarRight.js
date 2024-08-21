import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import XmppClientSingleton from "../../xmppClient";
import './SidebarRight.scss';

const SidebarRight = ({ xmppClient, selectedContactId }) => {
    const navigate = useNavigate();
    const [presenceStatus, setPresenceStatus] = useState("available");
    const [statusMessage, setStatusMessage] = useState("");
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const handleIncomingMessage = (message) => {
            const contactJid = message.from.split('/')[0];
            if (contactJid !== selectedContactId && message.body) {
                setNotifications(prevNotifications => [
                    ...prevNotifications,
                    { jid: contactJid, body: message.body, id: new Date().getTime() }
                ]);
            }
        };

        XmppClientSingleton.onMessage(handleIncomingMessage);

        return () => {
            XmppClientSingleton.removeMessageHandler(handleIncomingMessage);
        };
    }, [selectedContactId]); // Asegúrate de que el efecto se ejecute cada vez que selectedContactId cambie

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

    const handleDeleteAccount = async () => {
        try {
            await XmppClientSingleton.deleteAccount();
            console.log('Cuenta eliminada. Redirigiendo a inicio de sesión.');
            navigate('/');

        } catch (error) {
            console.error('Error al eliminar la cuenta:', error);
        }
    };
    

    const handlePresenceChange = (status) => {
        setPresenceStatus(status);
        XmppClientSingleton.sendPresence(status, statusMessage);
    };

    const removeNotification = (id) => {
        setNotifications(prevNotifications => 
            prevNotifications.filter(notification => notification.id !== id)
        );
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <div className="sidebar-right">
            <div className="notifications-section">
                <h3>Notificaciones</h3>
                <button className="clear-all-btn" onClick={clearNotifications}>Eliminar todas</button>
                <div className="notifications-list">
                    {notifications.map(notification => (
                        <div key={notification.id} className="notification-item">
                            <div>{notification.jid}: {notification.body}</div>
                            <button onClick={() => removeNotification(notification.id)}>x</button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="profile-logout-section">
                <div className="profile-info">
                    <div className={`avatar ${presenceStatus}`}>
                        {xmppClient.username.charAt(0).toUpperCase()}
                        <div className="status-indicator"></div>
                    </div>
                    <div>{xmppClient.username}</div>
                    <select
                        value={presenceStatus}
                        onChange={(e) => handlePresenceChange(e.target.value)}
                    >
                        <option value="available">Available</option>
                        <option value="away">Away</option>
                        <option value="dnd">Busy</option>
                        <option value="xa">Not Available</option>
                        <option value="offline">Offline</option>
                    </select>
                    <input
                        type="text"
                        value={statusMessage}
                        onChange={(e) => setStatusMessage(e.target.value)}
                        placeholder="Status message..."
                    />
                </div>
                <button onClick={handleLogOut}>Log Out</button>
                <button onClick={handleDeleteAccount} className="delete-account-btn">Eliminar Cuenta</button>
            </div>
        </div>
    );
};

export default SidebarRight;