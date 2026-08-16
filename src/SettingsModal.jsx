import { ToggleLeftIcon, ToggleRightIcon, XIcon } from "@phosphor-icons/react"
import Modal from "./Modal"
import LinkTelegram from "./LinkTelegram"

function SettingsModal({ onClose, isNotificationEnabled, handleNotificationPermissionSwitch,
    setTelegramCode, isTelegramConnected, onVerifyCode }) {
    return (
        <Modal onClose={onClose}>
            <div className="modal-title">Настройки</div>

            <div className="notification-settings">
                <div className="settings-name">Уведомления</div>
                <button
                    className={`button button-icon toggle ${isNotificationEnabled && `toggle-active`}`}
                    onClick={handleNotificationPermissionSwitch}
                >
                    {isNotificationEnabled ? <ToggleRightIcon size={40} weight="duotone" /> : <ToggleLeftIcon size={40} weight="duotone" />}
                </button>

            </div>

            <LinkTelegram
                setTelegramCode={setTelegramCode}
                isTelegramConnected={isTelegramConnected}
                onVerifyCode={onVerifyCode}
            />

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
