// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { SMLM_PRODUCT_LABEL } from '@lib/model/suse_multilinux_manager';

export const getSoftwareUpdatesErrorMessage = (errors) => {
  const hostNotFoundInSMLM = errors.some(
    ({ detail }) =>
      detail === 'The requested resource cannot be found.' ||
      detail ===
        `No system ID was found on ${SMLM_PRODUCT_LABEL} for this host.`
  );

  const connectionNotWorking = errors.some(
    ({ detail }) => detail === 'Something went wrong.'
  );

  if (hostNotFoundInSMLM) {
    return `Host not found in ${SMLM_PRODUCT_LABEL}`;
  }

  if (connectionNotWorking) {
    return `Connection to ${SMLM_PRODUCT_LABEL} not working`;
  }

  return 'Unknown';
};

export const getSoftwareUpdatesErrorTooltip = (errors) => {
  const hostNotFoundInSMLM = errors.some(
    ({ detail }) =>
      detail === 'The requested resource cannot be found.' ||
      detail ===
        `No system ID was found on ${SMLM_PRODUCT_LABEL} for this host.`
  );

  const connectionNotWorking = errors.some(
    ({ detail }) => detail === 'Something went wrong.'
  );

  if (hostNotFoundInSMLM) {
    return `Contact your ${SMLM_PRODUCT_LABEL} admin to ensure the host is managed by ${SMLM_PRODUCT_LABEL}`;
  }

  if (connectionNotWorking) {
    return `Please review ${SMLM_PRODUCT_LABEL} settings`;
  }

  if (errors.length) {
    return 'Trento was not able to retrieve the requested data.';
  }

  return undefined;
};
