import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import XmppClientSingleton from "../../xmppClient";
import './SidebarRight.scss';

const SidebarRight = ({ xmppClient }) => {
    const navigate = useNavigate();
    const [presenceStatus, setPresenceStatus] = useState("available");
    const [statusMessage, setStatusMessage] = useState("");

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

    const handlePresenceChange = (status) => {
        setPresenceStatus(status);
        XmppClientSingleton.sendPresence(status, statusMessage);
    };

    const handleStatusMessageChange = (message) => {
        setStatusMessage(message);
        XmppClientSingleton.sendPresence(presenceStatus, message);
    };

    return (
        <div className="sidebar-right">
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
                        onChange={(e) => handleStatusMessageChange(e.target.value)}
                        placeholder="Status message..."
                    />
                </div>
                <button onClick={handleLogOut}>Log Out</button>
            </div>
        </div>
    );
};

export default SidebarRight;
