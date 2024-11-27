const second = 1 * 1000;
const minute = 60 * second;

export const refreshRateOptions = [
  'off',
  5 * second,
  10 * second,
  30 * second,
  1 * minute,
  5 * minute,
  30 * minute,
];

export const refreshRateOptionsToLabel = {
  off: `Off`,
  [5 * second]: '5s',
  [10 * second]: '10s',
  [30 * second]: '30s',
  [1 * minute]: '1m',
  [5 * minute]: '5m',
  [30 * minute]: '30m',
};

export const detectRefreshRate = (number) =>
  refreshRateOptions.includes(Number(number))
    ? Number(number)
    : refreshRateOptions[0];

export const addRefreshRateToSearchParams = (searchParams, refreshRate) => {
  searchParams.set('refreshRate', refreshRate);
  return searchParams;
};

export const removeRefreshRateFromSearchParams = (searchParams) => {
  searchParams.delete('refreshRate');
  return searchParams;
};

export const resetAutorefresh = (currentInterval, operation, refreshRate) => {
  clearInterval(currentInterval);

  const detectedRefreshRate = detectRefreshRate(refreshRate);

  const interval =
    detectedRefreshRate !== 'off'
      ? setInterval(operation, detectedRefreshRate)
      : null;

  return { interval, cleanup: () => clearInterval(interval) };
};
