import { CheckIcon, LinkBreakIcon, LinkIcon } from "@phosphor-icons/react"
import { useState } from "react"
import useLocalStorage from "./hooks/useLocalStorage"

function LinkTelegram() {

    const [telegramCode, setTelegramCode] = useLocalStorage('telegramCode', '')
    const [isTelegramConnected, setIsTelegramConnected] = useState(false)

    async function verifyCode(code) {
        try {
            const response = await fetch(`http://localhost:3000/api/boards/${code}/status`)
            if (!response.ok) {
                throw new Error(response.status)
            }
            const answer = await response.json()
            if (answer.telegramConnected) {
                setIsTelegramConnected(true)
            } else {
                setIsTelegramConnected(false)
            }

        } catch (error) {
            setIsTelegramConnected(false)
            console.error(error)
        }
    }

    return (
        <div className="link-telegram">
            <div className="link-controls">
                <div className="settings-name">Привязать Telegram</div>
                <div>
                    {isTelegramConnected
                        ? <LinkIcon size={32} weight="duotone" color="var(--success)" />
                        : <LinkBreakIcon size={32} weight="duotone" color="var(--danger)" />
                    }
                </div>
                <input
                    className="select"
                    type="text"
                    value={telegramCode}
                    onChange={e => setTelegramCode(e.target.value)}
                />
                <button
                    className="button button-primary"
                    onClick={() => verifyCode(telegramCode)}
                >
                    <CheckIcon />
                </button>
            </div>
            <p className="modal-subtitle">Подключите Telegram,
                чтобы получать уведомления о дедлайнах и создавать задачи через бота.
                Откройте @cozy_kanban_bot, отправьте /start и введите полученный код.
            </p>
        </div>
    )
}

export default LinkTelegram
