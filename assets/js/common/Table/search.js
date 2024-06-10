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

export const searchByKey = (subject, predicate, ...key) => {
  let found = false;
  for (const it of key) {
    if (Object.hasOwn(subject, it)) {
      found ||= contains(subject[it] ?? '', predicate);
    }
  }

  return found;
};
