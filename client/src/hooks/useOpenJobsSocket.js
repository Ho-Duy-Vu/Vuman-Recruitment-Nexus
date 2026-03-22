import { useEffect, useRef } from 'react'

import { createPublicSocket } from '../utils/socketClient'

/**
 * Lắng nghe server `open_jobs:refresh` (sau publish/đóng job) và gọi onRefresh.
 */
export function useOpenJobsSocket(onRefresh) {
  const cbRef = useRef(onRefresh)
  cbRef.current = onRefresh

  useEffect(() => {
    const socket = createPublicSocket()
    const handler = () => {
      if (typeof cbRef.current === 'function') cbRef.current()
    }
    socket.on('open_jobs:refresh', handler)
    return () => {
      socket.off('open_jobs:refresh', handler)
      socket.disconnect()
    }
  }, [])
}
