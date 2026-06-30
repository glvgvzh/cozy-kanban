import { useEffect } from "react"

function DeleteTaskConfirmationModal({ taskTitle, setIsConfirmDeletionModalOpen, onDelete }) {
    useEffect(() => {
        function handleEsc(e) {
            if (e.key === 'Escape') setIsConfirmDeletionModalOpen(false)
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [setIsConfirmDeletionModalOpen])

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">Удалить задачу "{taskTitle}"?</h2>
                <div className="confirmation-action-buttons">
                    <button
                        className="modal-button cancel-deletion-button"
                        onClick={() => setIsConfirmDeletionModalOpen(false)}
                    >
                        Отмена
                    </button>
                    <button
                        className="modal-button confirm-deletion-button"
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
