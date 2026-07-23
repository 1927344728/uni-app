import { COS_DOMAIN_NAME, DEFAULT_COS_DOMAIN_NAME } from '@/config/constants';

export function replaceCosDomainName(uri: unknown) {
  return typeof uri === 'string' ? uri.replace(DEFAULT_COS_DOMAIN_NAME, COS_DOMAIN_NAME.replace(/^https?:\/\//, '')) : undefined;
}

export function scaleCosImage(uri: unknown, width = 240) {
  const normalized = replaceCosDomainName(uri);
  return normalized ? `${normalized}${normalized.includes('?') ? '&' : '?'}imageMogr2/thumbnail/${width}x` : undefined;
}
