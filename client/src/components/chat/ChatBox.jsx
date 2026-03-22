import { ChatPanel } from './ChatPanel'

/** Widget nổi (ví dụ nơi khác trong app cần chat nhanh). */
export function ChatBox({ applicationId, onClose }) {
  return (
    <ChatPanel
      variant="floating"
      applicationId={applicationId}
      onClose={onClose}
      showCopyApplicationId
    />
  )
}
