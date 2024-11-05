export const getSoftwareUpdatesErrorMessage = (errors) => {
  const hostNotFoundInSUMA = errors.some(
    ({ detail }) =>
      detail === 'The requested resource cannot be found.' ||
      detail === 'No system ID was found on SUSE Manager for this host.'
  );

  const connectionNotWorking = errors.some(
    ({ detail }) => detail === 'Something went wrong.'
  );

  if (hostNotFoundInSUMA) {
    return 'Host not found in SUSE Manager';
  }

  if (connectionNotWorking) {
    return 'Connection to SUMA not working';
  }

  return 'Unknown';
};

export const getSoftwareUpdatesErrorTooltip = (errors) => {
  const hostNotFoundInSUMA = errors.some(
    ({ detail }) =>
      detail === 'The requested resource cannot be found.' ||
      detail === 'No system ID was found on SUSE Manager for this host.'
  );

  const connectionNotWorking = errors.some(
    ({ detail }) => detail === 'Something went wrong.'
  );

  if (hostNotFoundInSUMA) {
    return 'Contact your SUSE Manager admin to ensure the host is managed by SUSE Manager';
  }

  if (connectionNotWorking) {
    return 'Please review SUSE Manager settings';
  }

  if (errors.length) {
    return 'Trento was not able to retrieve the requested data.';
  }

  return undefined;
};
