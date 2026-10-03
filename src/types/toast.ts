export type ToastOperation = 'create' | 'update' | 'delete'
export type ToastStatus = 'success' | 'fail'

export type ActiveToast = {
  id: string
  operation: ToastOperation
  status: ToastStatus
}

export type ToastConfigMap = {
  [Operation in ToastOperation]: {
    [Status in ToastStatus]: string
  }
}
