import { XIcon } from "@phosphor-icons/react";

function InstallBanner({ onDismiss, onInstall }) {

    return (
        <div className="install-banner">
            <div className="banner-label">Установите Cozy Kanban на устройство для быстрого доступа</div>
            <button 
                className="button"
                onClick={onInstall}
            >
                Установить
            </button>
            <button
                className="button-icon"
                onClick={onDismiss}
            >
                <XIcon size={18} />
            </button>
        </div>
    )
}

export default InstallBanner
