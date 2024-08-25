import React from 'react';
import './GroupInfoModal.scss';

const GroupInfoModal = ({ isOpen, group, onClose, onLeaveGroup }) => {

    if (!isOpen || !group) return null;

    return (
        <div className="group-info-modal">
            <div className="modal-content">
                <h3>Información del Grupo</h3>
                <p>Nombre del grupo: {group.jid.split('@')[0]}</p>
                <div className="modal-actions">
                    <button onClick={() => onLeaveGroup(group.jid)}>Salir del grupo</button>
                    <button onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default GroupInfoModal;
