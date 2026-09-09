import { XfTTSService } from './XfTTSService.js'
import { synthesizeTts } from '@/api/tts.js'
import { encodeMediaUrl } from '@/common/js/variables.js'

export class XfServerTTSService extends XfTTSService {
  constructor(config = {}) {
    super(config)
    console.log('XfServerTTSService')
  }

  async createAudioUrl (text, options = {}) {
    this.setState({ loading: true })
    try {
      const data = await synthesizeTts({
        text,
        ...this.toXfOptions(options)
      }, { timeout: 60000 })
      const url = data && data.url
      if (!url) {
        throw new Error('语音合成失败')
      }
      return encodeMediaUrl(url)
    } catch (error) {
      this.setState()
      throw error
    }
  }
}
