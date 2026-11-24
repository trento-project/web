// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { SAP_SYSTEM_START, SAP_SYSTEM_STOP } from '@lib/operations';

export const getSapSystemsBulkOperations = (onOperationSelected) => [
  {
    value: 'Start SAP system',
    running: false,
    disabled: false,
    permitted: ['start:sap_system'],
    onClick: () => onOperationSelected(SAP_SYSTEM_START, {}),
  },
  {
    value: 'Stop SAP system',
    running: false,
    disabled: false,
    permitted: ['stop:sap_system'],
    onClick: () => onOperationSelected(SAP_SYSTEM_STOP, {}),
  },
];
