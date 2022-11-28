export const toggle = (element, list) => (list.includes(element)
  ? list.filter((string) => string !== element)
  : [...list, element]);

export const hasOne = (elements, list) => elements.reduce(
  (accumulator, current) => accumulator || list.includes(current),
  false,
);

export const remove = (elements, list) => list.filter((value) => !elements.includes(value));

export const uniq = (list) => [...new Set(list)];

export const pages = (list) => {
  const hasRest = Boolean(list.length % 10);
  return hasRest ? ~~(list.length / 10) + 1 : ~~(list.length / 10);
};

export const page = (page, list) => {
  const start = 10 * (page - 1);
  const end = start + 10;
  return list.slice(start, end);
};

export const groupBy = (list, key) => list.reduce((rv, x) => {
  (rv[x[key]] = rv[x[key]] || []).push(x);
  return rv;
}, {});
