/* eslint-disable no-bitwise */

export const toggle = (element, list) =>
  list.includes(element)
    ? list.filter((string) => string !== element)
    : [...list, element];

export const hasOne = (elements, list) =>
  elements.reduce(
    (accumulator, current) => accumulator || list.includes(current),
    false
  );

export const pages = (list, itemsPerPage = 10) => {
  const hasRest = Boolean(list.length % itemsPerPage);
  return hasRest
    ? ~~(list.length / itemsPerPage) + 1
    : ~~(list.length / itemsPerPage);
};

export const page = (p, list, itemsPerPage = 10) => {
  const start = itemsPerPage * (p - 1);
  const end = start + itemsPerPage;
  return list.slice(start, end);
};
