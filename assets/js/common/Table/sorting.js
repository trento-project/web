export const createStringSortingPredicate = (key, direction) => {
  if (!key) {
    return null;
  }

  return (a, b) => {
    const string1 = a[key].toUpperCase();
    const string2 = b[key].toUpperCase();

    if (string1 < string2) {
      return direction === 'asc' ? -1 : 1;
    }

    if (string1 > string2) {
      return direction === 'asc' ? 1 : -1;
    }

    return 0;
  };
};

export const createNumberSortingPredicate = (key, direction) => {
  if (!key) {
    return null;
  }

  return (a, b) => {
    if (a[key] < b[key]) {
      return direction === 'asc' ? -1 : 1;
    }

    if (a[key] > b[key]) {
      return direction === 'asc' ? 1 : -1;
    }

    return 0;
  };
};

export const createDateSortingPredicate = (key, direction) => {
  if (!key) {
    return null;
  }

  return (a, b) => {
    const date1 = Date.parse(a[key]);
    const date2 = Date.parse(b[key]);

    if (date1 < date2) {
      return direction === 'asc' ? -1 : 1;
    }

    if (date1 > date2) {
      return direction === 'asc' ? 1 : -1;
    }

    return 0;
  };
};
