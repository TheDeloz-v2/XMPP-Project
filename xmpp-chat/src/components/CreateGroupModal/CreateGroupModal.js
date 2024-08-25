import React, { useState } from 'react';
import './CreateGroupModal.scss';

/**
 * CreateGroupModal component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - Indicates if the modal is open.
 * @param {function} props.onClose - The function to close the modal.
 * @param {function} props.onCreateGroup - The function to create a new group.
 * @returns {JSX.Element|null} The CreateGroupModal component.
 */
const CreateGroupModal = ({ isOpen, onClose, onCreateGroup }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [address, setAddress] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreateGroup({ name, description, isPrivate, address });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="create-group-modal">
            <div className="modal-content">
                <h2>Crear Nuevo Grupo</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nombre del Grupo</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Descripción (Opcional)</label>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={isPrivate}
                                onChange={() => setIsPrivate(!isPrivate)}
                            />
                            Grupo Privado
                        </label>
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Dirección (e.g., example@conference.alumchat.lol)</label>
                        <input
                            type="text"
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit">Crear Grupo</button>
                        <button type="button" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;