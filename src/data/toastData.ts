import type { ToastConfigMap } from '../types/toast'

export const toastConfig: ToastConfigMap = {
  create: {
    success: 'Задача создана',
    fail: 'Ошибка создания задачи',
  },
  update: {
    success: 'Задача изменена',
    fail: 'Ошибка изменения задачи',
  },
  delete: {
    success: 'Задача удалена',
    fail: 'Ошибка удаления задачи',
  },
}
