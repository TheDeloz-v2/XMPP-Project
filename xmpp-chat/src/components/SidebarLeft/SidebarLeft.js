import React from 'react';
import { useNavigate } from 'react-router-dom';
import XmppClientSingleton from "../../xmppClient";
import './SidebarLeft.scss';

const SidebarLeft = ({ contacts, xmppClient }) => {
    const navigate = useNavigate();

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

    return (
        <div className="sidebar-left">
            <div className="contact-list">
                {contacts.map((contact, index) => (
                    <div key={index} className="contact-item">
                        <div className={`avatar ${contact.state === 'online' ? 'online' : ''}`}>
                            {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="contact-info">
                            <div className="name">{contact.name}</div>
                            <div className="status">{contact.state}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="profile-logout-section">
                <div className="profile-info">
                    <div className="avatar">{xmppClient.username.charAt(0).toUpperCase()}</div>
                    <div>{xmppClient.username}</div>
                </div>
                <button onClick={handleLogOut}>Log Out</button>
            </div>
        </div>
    );
};

export default SidebarLeft;

