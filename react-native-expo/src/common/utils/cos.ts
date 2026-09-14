import { COS_DOMAIN_NAME, DEFAULT_COS_DOMAIN_NAME } from '@/config/constants';

export function replaceCosDomainName(uri: unknown) {
  return typeof uri === 'string' ? uri.replace(DEFAULT_COS_DOMAIN_NAME, COS_DOMAIN_NAME.replace(/^https?:\/\//, '')) : undefined;
}

/** 原生播放器不会自动编码路径中的中文，需显式 encode，且避免二次编码 */
export function encodeMediaUrl(uri: unknown) {
  const replaced = replaceCosDomainName(uri);
  if (!replaced) return undefined;

  const qIndex = replaced.indexOf('?');
  const hashIndex = replaced.indexOf('#');
  let suffixIndex = -1;
  if (qIndex >= 0 && hashIndex >= 0) suffixIndex = Math.min(qIndex, hashIndex);
  else if (qIndex >= 0) suffixIndex = qIndex;
  else if (hashIndex >= 0) suffixIndex = hashIndex;

  const base = suffixIndex >= 0 ? replaced.slice(0, suffixIndex) : replaced;
  const suffix = suffixIndex >= 0 ? replaced.slice(suffixIndex) : '';
  const protoMatch = base.match(/^(https?:\/\/[^/]+)(\/.*)?$/i);
  if (!protoMatch) return replaced;

  const encodedPath = (protoMatch[2] || '').split('/').map((seg) => {
    if (!seg) return seg;
    try {
      return encodeURIComponent(decodeURIComponent(seg));
    } catch {
      return encodeURIComponent(seg);
    }
  }).join('/');
  return protoMatch[1] + encodedPath + suffix;
}

export function scaleCosImage(uri: unknown, width = 240) {
  const normalized = replaceCosDomainName(uri);
  return normalized ? `${normalized}${normalized.includes('?') ? '&' : '?'}imageMogr2/thumbnail/${width}x` : undefined;
}
