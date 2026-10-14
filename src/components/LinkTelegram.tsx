import { CheckIcon, LinkBreakIcon, LinkIcon } from '@phosphor-icons/react'
import { useState } from 'react'

export type LinkTelegramProps = {
  setTelegramCode: (value: string) => void
  isTelegramConnected: boolean
  onVerifyCode: (code: string) => Promise<boolean>
}

export function LinkTelegram({
  setTelegramCode,
  isTelegramConnected,
  onVerifyCode,
}: LinkTelegramProps) {
  const [inputCode, setInputCode] = useState('')

  return (
    <div className="link-telegram">
      <div className="link-controls">
        <label htmlFor="code-input" className="settings-name">
          Привязать Telegram
        </label>
        <div>
          {isTelegramConnected ? (
            <LinkIcon size={32} weight="duotone" color="var(--success)" />
          ) : (
            <LinkBreakIcon size={32} weight="duotone" color="var(--danger)" />
          )}
        </div>
        <input
          id="code-input"
          className="select"
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
        />
        <button
          aria-label="Подтвердить код"
          className="button button-primary"
          onClick={async () => {
            const isConnected = await onVerifyCode(inputCode)
            if (isConnected) {
              setTelegramCode(inputCode)
            }
            setInputCode('')
          }}
        >
          <CheckIcon />
        </button>
      </div>
      <p className="modal-subtitle">
        Подключите Telegram, чтобы получать уведомления о дедлайнах и создавать задачи через бота.
        Откройте @cozy_kanban_bot, отправьте /start и введите полученный код.
      </p>
    </div>
  )
}
