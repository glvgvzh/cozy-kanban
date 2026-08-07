import { ToggleLeftIcon, ToggleRightIcon, XIcon } from "@phosphor-icons/react"
import Modal from "./Modal"

function SettingsModal({ onClose, isNotificationEnabled, handleNotificationPermissionSwitch,  }) {
    return (
        <Modal onClose={onClose}>
            <div className="modal-title">Настройки</div>

            <div className="notification-settings">
                <div>Уведомления</div>
                <button
                    className={`button button-icon toggle ${isNotificationEnabled && `toggle-active`}`}
                    onClick={handleNotificationPermissionSwitch}
                >
                    {isNotificationEnabled ? <ToggleRightIcon size={40} weight="duotone" /> : <ToggleLeftIcon size={40} weight="duotone" />}
                </button>

            </div>

            <button
                className="button button-icon close-modal-button"
                aria-label="Закрыть окно настроек"
                onClick={onClose}
            >
                <XIcon />
            </button>

        </Modal>
    )
}

export default SettingsModal
