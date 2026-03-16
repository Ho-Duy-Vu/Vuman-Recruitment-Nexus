import mammoth from 'mammoth'

// pdf-parse is a CJS module — use conditional require/import to support both
// native ESM (Node.js) and transformed CJS (Jest/Babel)
let pdfParse
try {
  // When Babel transforms to CJS, require is available
  // eslint-disable-next-line no-undef
  pdfParse = require('pdf-parse')
} catch {
  // Native ESM fallback: use createRequire
  const { createRequire } = await import('node:module')
  const _require = createRequire(import.meta.url)
  pdfParse = _require('pdf-parse')
}

export const extractText = async (buffer, mimeType) => {
  let text = ''
  let error = false

  try {
    if (mimeType === 'application/pdf') {
      const result = await pdfParse(buffer)
      text = result.text || ''
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer })
      text = result.value || ''
    } else {
      error = true
    }
  } catch {
    error = true
  }

  const trimmed = text.trim()

  if (!trimmed.length) {
    return { text: '', error: true, tooShort: true }
  }

  if (trimmed.length < 100) {
    return { text: trimmed, error, tooShort: true }
  }

  return { text: trimmed, error, tooShort: false }
}
