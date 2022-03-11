export const toggle = (element, list) =>
  list.includes(element)
    ? list.filter((string) => string !== element)
    : [...list, element];

export const hasOne = (elements, list) =>
  elements.reduce(
    (accumulator, current) => accumulator || list.includes(current),
    false
  );

export const remove = (elements, list) =>
  list.filter((value) => !elements.includes(value));

export const uniq = (list) => [...new Set(list)];
