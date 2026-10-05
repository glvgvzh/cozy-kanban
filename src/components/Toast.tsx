import type { ActiveToast } from '../types'
import { toastConfig } from '../data/toastData'
import { CheckCircleIcon, WarningCircleIcon } from '@phosphor-icons/react'

type ToastProps = {
  toast: ActiveToast
}

export function Toast({ toast }: ToastProps) {
  return (
    <div className={`toast ${toast.status === 'success' ? 'toast-success' : 'toast-fail'}`}>
      {toast.status === 'success' ? (
        <CheckCircleIcon size={24} weight="duotone" />
      ) : (
        <WarningCircleIcon size={24} weight="duotone" />
      )}
      <div>{toastConfig[toast.operation][toast.status]}</div>
    </div>
  )
}
