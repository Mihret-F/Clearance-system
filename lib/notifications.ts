export type NotificationType =
  | "request_status_change"
  | "document_requested"
  | "document_uploaded"
  | "approval_completed"
  | "request_rejected"
  | "request_approved"
  | "certificate_ready"

// Define notification interface
export interface Notification {
  id: number
  title: string
  message: string
  timestamp: string
  read: boolean
  type: NotificationType
  actionType?: string
  actionId?: string
  documentId?: string
}

// Function to create a new notification
export function createNotification(
  title: string,
  message: string,
  type: NotificationType,
  actionType?: string,
  actionId?: string,
  documentId?: string,
): Notification {
  return {
    id: Date.now(),
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    type,
    actionType,
    actionId,
    documentId,
  }
}

// Function to get notifications from localStorage
export function getNotifications(): Notification[] {
  if (typeof window === "undefined") return []

  const storedNotifications = localStorage.getItem("notifications")
  return storedNotifications ? JSON.parse(storedNotifications) : []
}

// Function to save notifications to localStorage
export function saveNotifications(notifications: Notification[]): void {
  if (typeof window === "undefined") return

  localStorage.setItem("notifications", JSON.stringify(notifications))
}

// Function to add a notification
export function addNotification(notification: Notification): void {
  const notifications = getNotifications()
  saveNotifications([notification, ...notifications])
}

// Function to mark a notification as read
export function markNotificationAsRead(id: number): void {
  const notifications = getNotifications()
  const updatedNotifications = notifications.map((notification) =>
    notification.id === id ? { ...notification, read: true } : notification,
  )
  saveNotifications(updatedNotifications)
}

// Function to mark all notifications as read
export function markAllNotificationsAsRead(): void {
  const notifications = getNotifications()
  const updatedNotifications = notifications.map((notification) => ({ ...notification, read: true }))
  saveNotifications(updatedNotifications)
}
