const WORDS_PAYLOAD_KEY = 'study_words_payload'

export function saveWordsPayload (payload = {}) {
  try {
    const words = Array.isArray(payload.words)
      ? payload.words.map(w => String(w || '').trim()).filter(Boolean)
      : []
    uni.setStorageSync(WORDS_PAYLOAD_KEY, {
      libraryId: payload.libraryId == null ? null : payload.libraryId,
      libraryTitle: String(payload.libraryTitle || ''),
      words,
      wordCount: Number(payload.wordCount) || words.length
    })
    return true
  } catch (e) {
    return false
  }
}

export function loadWordsPayload () {
  try {
    const payload = uni.getStorageSync(WORDS_PAYLOAD_KEY)
    if (!payload || typeof payload !== 'object') return null
    const words = Array.isArray(payload.words)
      ? payload.words.map(w => String(w || '').trim()).filter(Boolean)
      : []
    if (!words.length) return null
    return {
      libraryId: payload.libraryId == null ? null : payload.libraryId,
      libraryTitle: String(payload.libraryTitle || ''),
      words,
      wordCount: Number(payload.wordCount) || words.length
    }
  } catch (e) {
    return null
  }
}
