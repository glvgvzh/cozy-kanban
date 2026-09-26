type ModalProps = {
  children: React.ReactNode
  onClose: () => void
}

function Modal({ children, onClose }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export default Modal
