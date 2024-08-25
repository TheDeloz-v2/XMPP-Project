import React from 'react';
import './GroupInviteModal.scss';

/**
 * GroupInviteModal component.
 * 
 * @param {Object} props - The component props.
 * @param {string} props.groupJid - The JID of the group.
 * @param {string} props.inviter - The name of the inviter.
 * @param {Function} props.onJoin - The function to be called when the user joins the group.
 * @param {Function} props.onDecline - The function to be called when the user declines the invitation.
 * @returns {JSX.Element} The GroupInviteModal component.
 */
const GroupInviteModal = ({ groupJid, inviter, onJoin, onDecline }) => {
    return (
        <div className="group-invite-modal">
            <div className="modal-content">
                <h3>Invitación al Grupo</h3>
                <p>Has sido invitado al grupo: <strong>{groupJid}</strong></p>
                <p>Invitado por: <strong>{inviter}</strong></p>
                <div className="modal-buttons">
                    <button className="join-btn" onClick={() => onJoin(groupJid)}>Unirse</button>
                    <button className="decline-btn" onClick={onDecline}>Rechazar</button>
                </div>
            </div>
        </div>
    );
};

export default GroupInviteModal;