import React from 'react';
import './PresenceRequestModal.scss';

/**
 * Represents a modal component for presence request.
 * @param {Object} props - The component props.
 * @param {string} props.requester - The name of the requester.
 * @param {Function} props.onAccept - The function to handle accept action.
 * @param {Function} props.onDecline - The function to handle decline action.
 * @returns {JSX.Element} The presence request modal component.
 */
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