const canonicalise = (val) => val.normalize().trim().toLowerCase();

const stringContains = (subject, predicate) =>
  canonicalise(subject).includes(canonicalise(predicate));

const arrayContains = (subject, predicate) =>
  subject
    .map((it) => stringContains(it, predicate))
    .reduce((accumulator, currentValue) => accumulator || currentValue, false);

const contains = (subject, predicate) =>
  Array.isArray(subject)
    ? arrayContains(subject, predicate)
    : stringContains(subject, predicate);

export const searchByKey = (subject, predicate, ...key) =>
  key
    .map((it) =>
      Object.hasOwn(subject, it)
        ? contains(subject[it] ?? '', predicate)
        : false
    )
    .reduce((accumulator, currentValue) => accumulator || currentValue, false);
