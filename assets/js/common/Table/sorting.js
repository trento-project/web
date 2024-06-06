export const createStringSortingPredicate = (key, direction) => {
  if (!key) {
    return null;
  }

  return (a, b) => {
    const keyA = a[key].toUpperCase();
    const keyB = b[key].toUpperCase();

    if (keyA < keyB) {
      return direction === 'asc' ? -1 : 1;
    }

    if (keyA > keyB) {
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
