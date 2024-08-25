import React from 'react';
import './PresenceRequestModal.scss';

const PresenceRequestModal = ({ requester, onAccept, onDecline }) => {
    return (
        <div className="presence-request-modal">
            <div className="modal-content">
                <h3>Solicitud de Presencia</h3>
                <p>{requester} quiere ver tu estado.</p>
                <div className="modal-actions">
                    <button onClick={() => onAccept(requester)}>Aceptar</button>
                    <button onClick={() => onDecline(requester)}>Rechazar</button>
                </div>
            </div>
        </div>
    );
};

export default PresenceRequestModal;
