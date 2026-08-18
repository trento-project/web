// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { zipWith } from 'lodash';

export function buildCidrNotation(ipAddresses, netmasks) {
  return zipWith(
    ipAddresses,
    netmasks,
    (address, netmask) => `${address}${netmask ? `/${netmask}` : ''}`
  );
}
