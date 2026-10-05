import { useEffect } from 'react'
import Modal from './Modal'

type DeleteTaskConfirmationModalProps = {
  taskTitle: string
  setIsConfirmDeletionModalOpen: (value: boolean) => void
  onDelete: () => void
  isDisabled: boolean
}

function DeleteTaskConfirmationModal({
  taskTitle,
  setIsConfirmDeletionModalOpen,
  onDelete,
  isDisabled,
}: DeleteTaskConfirmationModalProps) {
  useEffect(() => {
    function handleEsc(e: KeyboardEvent): void {
      if (e.key === 'Escape') setIsConfirmDeletionModalOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [setIsConfirmDeletionModalOpen])

  return (
    <Modal onClose={() => setIsConfirmDeletionModalOpen(false)}>
      <h2 className="modal-title">Удалить задачу "{taskTitle}"?</h2>
      <div className="confirmation-action-buttons">
        <button
          className="button button-primary modal-button cancel-deletion-button"
          onClick={() => setIsConfirmDeletionModalOpen(false)}
        >
          Отмена
        </button>
        <button
          className="button button-danger confirm-deletion-button"
          disabled={isDisabled}
          onClick={onDelete}
        >
          Удалить
        </button>
      </div>
    </Modal>
  )
}

export default DeleteTaskConfirmationModal
