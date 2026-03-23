import { keyBy, get } from 'lodash';
import { pipe, map, fromPairs, compact } from 'lodash/fp';

const mapSwap = (swap_total, swap_avail) => {
  const totalBytes = get(swap_total, 'value');
  const availBytes = get(swap_avail, 'value');

  if (typeof totalBytes !== 'number' || typeof availBytes !== 'number') {
    return null;
  }

  return {
    totalBytes,
    availBytes,
    usedBytes: totalBytes - availBytes,
  };
};

export const calculateFilesystemUsage = ({
  filesystems_size = [],
  filesystems_avail = [],
  swap_total,
  swap_avail,
}) => {
  const sizeByMountpoint = keyBy(filesystems_size, 'metric.mountpoint');

  const mountpoints = pipe(
    map((availData) => {
      const mountpoint = get(availData, 'metric.mountpoint');
      const sizeData = get(sizeByMountpoint, mountpoint);

      if (sizeData) {
        const totalBytes = get(sizeData, 'sample.value');
        const availBytes = get(availData, 'sample.value');
        return [
          mountpoint,
          {
            device: get(sizeData, 'metric.device'),
            totalBytes,
            availBytes,
            usedBytes: totalBytes - availBytes,
          },
        ];
      }
      return null;
    }),
    compact,
    fromPairs
  )(filesystems_avail);

  return {
    mountpoints,
    swap: mapSwap(swap_total, swap_avail),
  };
};
