
import XFTTS from './XfTTS.js';
export class H5TTSService {
  constructor(config = {}) {
    this.config = {
      voice: '',
      rate: 1.0,
      volume: 1.0,
      pitch: 1.0,
      ...config
    }
    this.isSpeaking = false
    this.isPaused = false
  }

  async speak(text, options = {}) {
    if (!text) {
      return Promise.reject('文本内容不能为空')
    }
    
    try {
      // #ifdef H5
      return await this.play(text, options)
      // #endif
      uni.showToast({
        title: '平台不支持',
        icon: 'error'
      });
      return Promise.reject('平台不支持')
    } catch (error) {
      console.error('TTS播放失败:', error)
      throw error
    }
  }

  async play(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject('浏览器不支持Web Speech API')
        return
      }
      this.stop()

      const config = { ...this.config, ...options }
      const utterance = new SpeechSynthesisUtterance(text)
      
      utterance.rate = config.rate || 1
      utterance.volume = config.volume || 1.0
      utterance.pitch = config.pitch || 1.0
      if (config.lang) {
        utterance.lang = config.lang
      }
      if (config.voice && window.speechSynthesis.getVoices().length > 0) {
        const voices = window.speechSynthesis.getVoices()
        const voice = voices.find(v => v.name.includes(config.voice))
        if (voice) {
          utterance.voice = voice
        }
      }

      utterance.onend = () => {
        this.stop()
        if (options.onEnded) {
          options.onEnded();
        }
      }

      utterance.onerror = (event) => {
        this.destroy()
        if (options.onError){
          options.onError(event.error);
        }
      }

      if (this.isSpeaking) {
        setTimeout(() => {
          window.speechSynthesis.speak(utterance)
          this.isSpeaking = true
        }, 300)
      } else {
        window.speechSynthesis.speak(utterance)
        this.isSpeaking = true
      }
    })
  }

  stop() {
    // #ifdef H5
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    // #endif
  }

  pause() {
    // #ifdef H5
    if (window.speechSynthesis) {
      window.speechSynthesis.pause()
      this.isSpeaking = false
      this.isPaused = true
    }
    // #endif
  }

  resume() {
    // #ifdef H5
    if (window.speechSynthesis) {
      window.speechSynthesis.resume()
      this.isSpeaking = true
      this.isPaused = false
    }
    // #endif
  }

  destroy () {
    this.stop()
    this.isSpeaking = false
    this.isPaused = false
  }
}

export class XfTTSService  {
  constructor(config) {
    this.xfTTSInstance = new XFTTS(config);
    this.innerAudioContext = null;
    this.currentAudioUrl = null;
    this.isSpeaking = false;
    this.isPaused = false;
  }
  
  async speak(text, options = {}) {
    try {
      const ttsOptions = {}
      if (ttsOptions.vcn) {
        ttsOptions.vcn = options.vcn;
      }
      if (options.rate) {
        ttsOptions.speed = options.rate * 100;
      }
      if (ttsOptions.volume) {
        ttsOptions.volume = options.volume;
      }
      const audioUrl = await this.xfTTSInstance.textToAudioUrl(text, ttsOptions)
      await this.play(audioUrl, options || {});
      return audioUrl;
    } catch (error) {
      throw error;
    }
  }

  play(audioUrl, options = {}) {
    return new Promise((resolve, reject) => {
      this.destroy();
      
      this.innerAudioContext = uni.createInnerAudioContext();
      this.innerAudioContext.src = audioUrl;
      this.currentAudioUrl = audioUrl;
      
      if (options.autoplay !== false) {
        this.innerAudioContext.autoplay = true;
      }
      
      if (options.volume !== undefined) {
        this.innerAudioContext.volume = options.volume;
      }
      
      this.innerAudioContext.onPlay(() => {
        console.log('音频开始播放');
        if (options.onPlay) {
          options.onPlay();
        }
      });
      
      this.innerAudioContext.onEnded(() => {
        console.log('音频播放结束');
        if (options.onEnded) {
          options.onEnded()
        };
        resolve();
      });
      
      this.innerAudioContext.onError((error) => {
        console.error('音频播放错误:', error);
        console.error('音频源路径:', audioUrl);
        console.error('错误详情:', JSON.stringify(error));
        if (options.onError){
          options.onError(error);
        }
        reject(error);
      });
      
      this.isSpeaking = true;
      this.innerAudioContext.play();
    });
  }

  stop() {
    if (this.innerAudioContext) {
      this.isSpeaking = false
      this.innerAudioContext.stop();
      this.innerAudioContext.destroy();
      this.innerAudioContext = null;
    }
  }

  pause() {
    if (this.innerAudioContext && !this.innerAudioContext.paused) {
      this.isPaused = true
      this.innerAudioContext.pause();
    }
  }

  resume() {
    if (this.innerAudioContext && this.innerAudioContext.paused) {
      this.isPaused = false
      this.innerAudioContext.play();
    }
  }

  destroy() {
    this.stop();
    this.revokeAudioUrl(this.currentAudioUrl);
    this.currentAudioUrl = null;
    this.isSpeaking = false
    this.isPaused = false
  }

  revokeAudioUrl(audioUrl) {
    // #ifdef H5
    if (audioUrl && audioUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(audioUrl);
      } catch (error) {
        console.warn('清理 blob URL 失败:', error);
      }
    }
    // #endif
  }
}