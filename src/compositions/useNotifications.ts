import { Notification, NotificationType } from '@/types'
import { ref, Ref, computed, ComputedRef } from 'vue'

export default function useNotifications(): {
  notification: Ref<{
    message?: string | undefined
    type?: string | undefined
  }>
  clearNotification: () => void
  hasNotification: ComputedRef<boolean>
  setNotification: (message: string, type?: NotificationType) => void
} {
  const notification = ref({} as Notification)

  const hasNotification = computed(() => Boolean(notification.value.message))

  const clearNotification = () => {
    notification.value = {}
  }

  const setNotification = (message: string, type = 'primary') =>
    (notification.value = {
      message,
      type,
    })

  return {
    notification,
    clearNotification,
    hasNotification,
    setNotification,
  }
}
