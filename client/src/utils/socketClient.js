import { io } from 'socket.io-client'

/**
 * Base URL for Socket.io (no path). Using the API origin in dev avoids flaky Vite `/socket.io` WS proxy (ECONNABORTED).
 * Set `VITE_SOCKET_ORIGIN` if the API runs on a non-default host/port.
 */
export function getSocketConnectionUrl() {
  const explicit = import.meta.env.VITE_SOCKET_ORIGIN
  if (explicit && String(explicit).trim()) {
    return String(explicit).replace(/\/$/, '')
  }

  const api = import.meta.env.VITE_API_URL
  if (typeof api === 'string' && api.startsWith('http')) {
    try {
      return new URL(api).origin
    } catch {
      /* ignore */
    }
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:5000'
  }

  return undefined
}

/** @param {import('socket.io-client').ManagerOptions & import('socket.io-client').SocketOptions} options */
export function createAppSocket(options = {}) {
  const url = getSocketConnectionUrl()
  return io(url, {
    path: '/socket.io',
    ...options
  })
}

/** Socket không bắt buộc JWT — dùng cho phòng `public:jobs` (danh sách việc mở). */
export function createPublicSocket(options = {}) {
  const url = getSocketConnectionUrl()
  return io(url, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    ...options
  })
}
