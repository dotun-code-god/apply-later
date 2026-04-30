import { BadRequestException } from '@nestjs/common';

const TRACKING_PARAM_PATTERNS = [/^utm_/i];
const TRACKING_PARAMS = new Set([
  'fbclid',
  'gclid',
  'gclsrc',
  'dclid',
  'msclkid',
  'mc_cid',
  'mc_eid',
  '_ga',
  '_gl',
]);

export interface NormalizedUrl {
  originalUrl: string;
  normalizedUrl: string;
  canonicalUrl: string;
}

function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

function shouldDropParam(name: string) {
  if (TRACKING_PARAMS.has(name)) {
    return true;
  }

  return TRACKING_PARAM_PATTERNS.some((pattern) => pattern.test(name));
}

export function normalizeOpportunityUrl(input: string): NormalizedUrl {
  let parsed: URL;

  try {
    parsed = new URL(input.trim());
  } catch {
    throw new BadRequestException('Please provide a valid absolute URL');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new BadRequestException('Only http and https URLs are supported');
  }

  parsed.hash = '';
  parsed.username = '';
  parsed.password = '';
  parsed.hostname = parsed.hostname.toLowerCase();
  parsed.protocol = parsed.protocol.toLowerCase();
  parsed.pathname = normalizePathname(parsed.pathname);

  if ((parsed.protocol === 'https:' && parsed.port === '443') || (parsed.protocol === 'http:' && parsed.port === '80')) {
    parsed.port = '';
  }

  const keptParams = [...parsed.searchParams.entries()]
    .filter(([key]) => !shouldDropParam(key))
    .sort(([a, aValue], [b, bValue]) => {
      if (a === b) {
        return aValue.localeCompare(bValue);
      }

      return a.localeCompare(b);
    });

  parsed.search = '';
  for (const [key, value] of keptParams) {
    parsed.searchParams.append(key, value);
  }

  const normalizedUrl = parsed.toString();
  const canonicalUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}${parsed.search}`;

  return {
    originalUrl: input.trim(),
    normalizedUrl,
    canonicalUrl,
  };
}
