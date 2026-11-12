// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { DATABASE_START, DATABASE_STOP } from '@lib/operations';

export const getDatabasesBulkOperations = (onOperationSelected) => [
  {
    value: 'Start database',
    running: false,
    disabled: false,
    permitted: ['start:database'],
    onClick: () => onOperationSelected(DATABASE_START, {}),
  },
  {
    value: 'Stop database',
    running: false,
    disabled: false,
    permitted: ['stop:database'],
    onClick: () => onOperationSelected(DATABASE_STOP, {}),
  },
];
