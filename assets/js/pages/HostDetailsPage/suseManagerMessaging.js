import { SUMA_PRODUCT_LABEL_SHORT } from '@lib/model/suse_manager';

export const getSoftwareUpdatesErrorMessage = (errors) => {
  const hostNotFoundInSUMA = errors.some(
    ({ detail }) =>
      detail === 'The requested resource cannot be found.' ||
      detail ===
        `No system ID was found on ${SUMA_PRODUCT_LABEL_SHORT} for this host.`
  );

  const connectionNotWorking = errors.some(
    ({ detail }) => detail === 'Something went wrong.'
  );

  if (hostNotFoundInSUMA) {
    return `Host not found in ${SUMA_PRODUCT_LABEL_SHORT}`;
  }

  if (connectionNotWorking) {
    return `Connection to ${SUMA_PRODUCT_LABEL_SHORT} not working`;
  }

  return 'Unknown';
};

export const getSoftwareUpdatesErrorTooltip = (errors) => {
  const hostNotFoundInSUMA = errors.some(
    ({ detail }) =>
      detail === 'The requested resource cannot be found.' ||
      detail ===
        `No system ID was found on ${SUMA_PRODUCT_LABEL_SHORT} for this host.`
  );

  const connectionNotWorking = errors.some(
    ({ detail }) => detail === 'Something went wrong.'
  );

  if (hostNotFoundInSUMA) {
    return `Contact your ${SUMA_PRODUCT_LABEL_SHORT} admin to ensure the host is managed by ${SUMA_PRODUCT_LABEL_SHORT}`;
  }

  if (connectionNotWorking) {
    return `Please review ${SUMA_PRODUCT_LABEL_SHORT} settings`;
  }

  if (errors.length) {
    return 'Trento was not able to retrieve the requested data.';
  }

  return undefined;
};
