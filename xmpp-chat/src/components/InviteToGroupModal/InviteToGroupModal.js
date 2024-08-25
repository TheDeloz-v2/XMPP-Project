import React, { useState } from 'react';
import './InviteToGroupModal.scss';

const InviteToGroupModal = ({ isOpen, onClose, onInvite, groupJid }) => {
    const [inviteeJid, setInviteeJid] = useState('');
    const [reason, setReason] = useState('');

    const handleInvite = () => {
        if (inviteeJid) {
            onInvite(groupJid, inviteeJid, reason);
            setInviteeJid('');
            setReason('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="invite-to-group-modal">
            <div className="modal-content">
                <h2>Invitar a un contacto al grupo</h2>
                <input
                    type="text"
                    placeholder="JID del contacto"
                    value={inviteeJid}
                    onChange={(e) => setInviteeJid(e.target.value)}
                />
                <textarea
                    placeholder="Razón (opcional)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
                <div className="modal-actions">
                    <button onClick={handleInvite}>Invitar</button>
                    <button onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default InviteToGroupModal;
