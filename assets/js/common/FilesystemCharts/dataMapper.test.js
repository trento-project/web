import { calculateFilesystemUsage } from './dataMapper';
import {
  filesystemFactory,
  swapFactory,
} from '@lib/test-utils/factories/charts';

describe('dataMapper', () => {
  it('should correctly calculate filesystem and swap usage', () => {
    const commonRootMetric = { mountpoint: '/', device: '/dev/sda1' };
    const commonDataMetric = { mountpoint: '/data', device: '/dev/sdb1' };

    const filesystems_size = [
      filesystemFactory.build({
        metric: commonRootMetric,
        sample: { value: 1000 },
      }),
      filesystemFactory.build({
        metric: commonDataMetric,
        sample: { value: 2000 },
      }),
    ];

    const filesystems_avail = [
      filesystemFactory.build({
        metric: commonRootMetric,
        sample: { value: 500 },
      }),
      filesystemFactory.build({
        metric: commonDataMetric,
        sample: { value: 1000 },
      }),
    ];

    const swap_total = swapFactory.build({ value: 512 });
    const swap_avail = swapFactory.build({ value: 256 });

    const result = calculateFilesystemUsage({
      filesystems_size,
      filesystems_avail,
      swap_total,
      swap_avail,
    });

    expect(result).toEqual({
      mountpoints: {
        '/': {
          device: '/dev/sda1',
          totalBytes: 1000,
          availBytes: 500,
          usedBytes: 500,
        },
        '/data': {
          device: '/dev/sdb1',
          totalBytes: 2000,
          availBytes: 1000,
          usedBytes: 1000,
        },
      },
      swap: {
        totalBytes: 512,
        availBytes: 256,
        usedBytes: 256,
      },
    });
  });

  it('should return null for swap when swap data is not available', () => {
    const metric = { mountpoint: '/', device: '/dev/sda1' };
    const filesystems_size = [
      filesystemFactory.build({
        metric,
        sample: { value: 1000 },
      }),
    ];
    const filesystems_avail = [
      filesystemFactory.build({
        metric,
        sample: { value: 500 },
      }),
    ];

    const result = calculateFilesystemUsage({
      filesystems_size,
      filesystems_avail,
    });

    expect(result.swap).toBeNull();
    expect(result.mountpoints).toEqual({
      '/': {
        device: '/dev/sda1',
        totalBytes: 1000,
        availBytes: 500,
        usedBytes: 500,
      },
    });
  });
});
