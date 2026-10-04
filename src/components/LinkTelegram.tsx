import { CheckIcon, LinkBreakIcon, LinkIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

type LinkTelegramProps = {
  setTelegramCode: Dispatch<SetStateAction<string>>
  isTelegramConnected: boolean
  onVerifyCode: (code: string) => Promise<boolean>
}

function LinkTelegram({ setTelegramCode, isTelegramConnected, onVerifyCode }: LinkTelegramProps) {
  const [inputCode, setInputCode] = useState('')

  return (
    <div className="link-telegram">
      <div className="link-controls">
        <div className="settings-name">Привязать Telegram</div>
        <div>
          {isTelegramConnected ? (
            <LinkIcon size={32} weight="duotone" color="var(--success)" />
          ) : (
            <LinkBreakIcon size={32} weight="duotone" color="var(--danger)" />
          )}
        </div>
        <input
          className="select"
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
        />
        <button
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

export default LinkTelegram
