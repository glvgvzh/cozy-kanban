function DeleteTaskConfirmationModal({ taskTitle, setConfirmDeletionModalOpen, onDelete }) {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">Удалить задачу "{taskTitle}"?</h2>
                <div className="confirmation-action-buttons">
                    <button
                        className="cancel-deletion-button"
                        onClick={() => setConfirmDeletionModalOpen(false)}
                    >
                        Отмена
                    </button>
                    <button
                        className="confirm-deletion-button"
                        onClick={onDelete}
                    >
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteTaskConfirmationModal
