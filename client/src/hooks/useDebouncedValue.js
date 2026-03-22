import { useEffect, useState } from 'react'

/**
 * Trì hoãn cập nhật giá trị (mặc định 280ms) — giảm tần suất API / tính toán nặng.
 */
export function useDebouncedValue(value, delayMs = 280) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(id)
  }, [value, delayMs])

  return debounced
}
