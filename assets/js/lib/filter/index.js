const regularizeString = (str) => str.normalize().trim().toLowerCase();

export const foundStringNaive = (str = '', substring = '') =>
  regularizeString(str).includes(regularizeString(substring));
