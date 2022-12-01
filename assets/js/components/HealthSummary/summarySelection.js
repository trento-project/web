export const any = (predicate, label) => Object.keys(predicate).reduce((accumulator, key) => {
  if (accumulator) {
    return true;
  }
  return predicate[key] === label;
}, false);

export const isMostRelevantPrio = (predicate, label) => {
  switch (label) {
    case 'critical':
      return any(predicate, label);

    case 'warning':
      return !any(predicate, 'critical') && any(predicate, label);

    case 'passing':
      return (
        !any(predicate, 'critical')
        && !any(predicate, 'warning')
        && any(predicate, label)
      );
    default:
      return null;
  }
};

export const getCounters = (data) => {
  const defaultCounter = {
    critical: 0, warning: 0, passing: 0, unknown: 0,
  };

  if (!data || data.length === 0) {
    return defaultCounter;
  }

  return data.reduce((accumulator, element) => {
    if (isMostRelevantPrio(element, 'critical')) {
      return { ...accumulator, critical: accumulator.critical + 1 };
    }

    if (isMostRelevantPrio(element, 'warning')) {
      return { ...accumulator, warning: accumulator.warning + 1 };
    }

    if (isMostRelevantPrio(element, 'unknown')) {
      return { ...accumulator, unknown: accumulator.unknown + 1 };
    }

    if (isMostRelevantPrio(element, 'passing')) {
      return { ...accumulator, passing: accumulator.passing + 1 };
    }
    return accumulator;
  }, defaultCounter);
};
