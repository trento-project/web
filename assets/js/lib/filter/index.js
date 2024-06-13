const regularizeString = (str) => str.normalize().trim().toLowerCase();

export const containsSubstring = (str = '', substring = '') =>
  regularizeString(str).includes(regularizeString(substring));
