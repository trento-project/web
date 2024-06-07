export const createStringSortingPredicate = (key, direction) => {
  if (!key) {
    return null;
  }

  return (a, b) => {
    const stringA = a[key].toUpperCase();
    const stringB = b[key].toUpperCase();

    if (stringA < stringB) {
      return direction === 'asc' ? -1 : 1;
    }

    if (stringA > stringB) {
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
    const dateA = Date.parse(a[key]);
    const dateB = Date.parse(b[key]);

    if (dateA < dateB) {
      return direction === 'asc' ? -1 : 1;
    }

    if (dateA > dateB) {
      return direction === 'asc' ? 1 : -1;
    }

    return 0;
  };
};
