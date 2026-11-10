// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { HOST_REBOOT } from '@lib/operations';

export const getHostsBulkOperations = (onOperationSelected) => [
  {
    value: 'Reboot host',
    running: false,
    disabled: false,
    permitted: ['reboot:host'],
    onClick: () => onOperationSelected(HOST_REBOOT, {}),
  },
];
