import { formatBytes } from './index';

describe('formatBytes', () => {
  it('should return "0 Bytes" for 0', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('should format bytes correctly', () => {
    expect(formatBytes(100)).toBe('100 Bytes');
  });

  it('should format kilobytes correctly', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('should format megabytes correctly', () => {
    expect(formatBytes(1024 ** 2)).toBe('1 MB');
    expect(formatBytes(1.5 * 1024 ** 2)).toBe('1.5 MB');
  });

  it('should format gigabytes correctly', () => {
    expect(formatBytes(1024 ** 3)).toBe('1 GB');
  });

  it('should format terabytes correctly', () => {
    expect(formatBytes(1024 ** 4)).toBe('1 TB');
  });

  it('should format petabytes correctly', () => {
    expect(formatBytes(1024 ** 5)).toBe('1 PB');
  });

  it('should format exabytes correctly', () => {
    expect(formatBytes(1024 ** 6)).toBe('1 EB');
  });

  it('should format zettabytes correctly', () => {
    expect(formatBytes(1024 ** 7)).toBe('1 ZB');
  });

  it('should format yottabytes correctly', () => {
    expect(formatBytes(1024 ** 8)).toBe('1 YB');
  });

  it('should handle the decimals parameter', () => {
    expect(formatBytes(1500, 0)).toBe('1 KB');
    expect(formatBytes(1500, 3)).toBe('1.465 KB');
  });

  it('should handle negative decimals parameter', () => {
    expect(formatBytes(1500, -1)).toBe('1 KB');
  });
});
