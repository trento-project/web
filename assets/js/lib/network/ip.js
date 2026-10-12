// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { zipWith } from 'lodash';

export function buildCidrNotation(ipAddresses, netmasks) {
  return zipWith(
    ipAddresses,
    netmasks,
    (address, netmask) => `${address}${netmask ? `/${netmask}` : ''}`
  );
}
