import { Buffer } from 'buffer';
import iconv from 'iconv-lite';

export function ArrayBufferToGBK (arrayBuffer) {
  try {
    if (typeof Blob !== 'undefined' && typeof FileReader !== 'undefined') {
      return new Promise((resolve) => {
        const blob = new Blob([arrayBuffer], { type: 'text/plain;charset=gbk' })
        const reader = new FileReader()
        reader.onload = () => {
          resolve(reader.result)
        }
        reader.onerror = () => {
          resolve('')
        }
        reader.readAsText(blob, 'gbk')
      })
    }

    if (typeof plus !== 'undefined' && plus.io) {
      const buffer = Buffer.from(arrayBuffer);
      const gbkText = iconv.decode(buffer, 'gbk')
      console.log('Buffer + iconv-lite，解码！')
      return gbkText
    }
  } catch (err) {
    console.error('ArrayBufferToGBK error', err)
  }
  return ''
}