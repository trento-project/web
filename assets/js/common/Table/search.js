const regularize = (val) => val.normalize().trim().toLowerCase();

const stringContains = (str, substring) =>
  regularize(str).includes(regularize(substring));

const arrayContains = (arr, substring) =>
  arr.map((str) => stringContains(str, substring)).includes(true);

const contains = (str, substring) =>
  Array.isArray(str)
    ? arrayContains(str, substring)
    : stringContains(str, substring);

export const search = (row, searchTerm, columnKeys) =>
  columnKeys
    .map((it) =>
      Object.hasOwn(row, it) ? contains(row[it] ?? '', searchTerm) : false
    )
    .includes(true);
