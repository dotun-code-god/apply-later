// import { BadRequestException } from '@nestjs/common';
// import { normalizeOpportunityUrl } from './url-normalizer';

// describe('normalizeOpportunityUrl', () => {
//   it('strips tracking params, fragments, and sorts retained params', () => {
//     const result = normalizeOpportunityUrl(
//       'https://Example.com/jobs/123/?utm_source=newsletter&b=2&a=1#section',
//     );

//     expect(result.originalUrl).toBe(
//       'https://Example.com/jobs/123/?utm_source=newsletter&b=2&a=1#section',
//     );
//     expect(result.normalizedUrl).toBe('https://example.com/jobs/123?a=1&b=2');
//     expect(result.canonicalUrl).toBe('https://example.com/jobs/123?a=1&b=2');
//   });

//   it('normalizes default ports and trailing slashes', () => {
//     const result = normalizeOpportunityUrl('https://example.com:443/opportunities/');

//     expect(result.normalizedUrl).toBe('https://example.com/opportunities');
//     expect(result.canonicalUrl).toBe('https://example.com/opportunities');
//   });

//   it('rejects unsupported or invalid urls', () => {
//     expect(() => normalizeOpportunityUrl('not-a-url')).toThrow(BadRequestException);
//     expect(() => normalizeOpportunityUrl('ftp://example.com/file')).toThrow(
//       BadRequestException,
//     );
//   });
// });
