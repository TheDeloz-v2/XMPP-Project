import React, { useState } from 'react';
import './GroupInfoModal.scss';
import InviteToGroupModal from '../../InviteToGroupModal/InviteToGroupModal';

/**
 * GroupInfoModal component displays information about a group.
 * 
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - Flag indicating if the modal is open.
 * @param {Object} props.group - The group object containing information about the group.
 * @param {Function} props.onClose - The function to close the modal.
 * @param {Function} props.onLeaveGroup - The function to leave the group.
 * @param {Function} props.onInvite - The function to invite users to the group.
 * @returns {JSX.Element|null} The GroupInfoModal component.
 */
const GroupInfoModal = ({ isOpen, group, onClose, onLeaveGroup, onInvite }) => {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    if (!isOpen || !group) return null;

    const handleOpenInviteModal = () => {
        setIsInviteModalOpen(true);
    };

    const handleCloseInviteModal = () => {
        setIsInviteModalOpen(false);
    };

    return (
        <div className="group-info-modal">
            <div className="modal-content">
                <h3>Información del Grupo</h3>
                <p>Nombre del grupo: {group.jid.split('@')[0]}</p>
                <div className="modal-actions">
                    <button onClick={() => onLeaveGroup(group.jid)}>Salir del grupo</button>
                    <button onClick={handleOpenInviteModal} className="button-invite">Invitar a usuarios</button> {/* Botón para abrir el modal de invitación */}
                    <button onClick={onClose} >Cerrar</button>
                </div>
            </div>

            <InviteToGroupModal
                isOpen={isInviteModalOpen}
                onClose={handleCloseInviteModal}
                onInvite={onInvite}
                groupJid={group.jid}
            />
        </div>
    );
};

export default GroupInfoModal;