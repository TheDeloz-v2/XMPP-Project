import React from 'react';
import './GroupInviteModal.scss';

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
