const GEN_DICTATION_STORAGE_KEY = 'study_gen_dictation_payload'

export function saveGenDictationPayload ({ note, words } = {}) {
  try {
    uni.setStorageSync(GEN_DICTATION_STORAGE_KEY, {
      note: String(note || ''),
      words: String(words || '')
    })
    return true
  } catch (e) {
    return false
  }
}

export function consumeGenDictationPayload () {
  try {
    const payload = uni.getStorageSync(GEN_DICTATION_STORAGE_KEY)
    uni.removeStorageSync(GEN_DICTATION_STORAGE_KEY)
    if (!payload || typeof payload !== 'object') return null
    return {
      note: String(payload.note || ''),
      words: String(payload.words || '')
    }
  } catch (e) {
    return null
  }
}
