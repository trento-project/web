// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { HOST_REBOOT } from '@lib/operations';

export const getHostsBulkOperations = (
  selectedHosts,
  setBulkOperationModalOpen
) => {
  const openModal = (operation, params) =>
    setBulkOperationModalOpen({
      open: true,
      operation,
      params,
      hosts: selectedHosts,
    });

  return [
    {
      value: 'Reboot host',
      running: false,
      disabled: false,
      permitted: ['reboot:host'],
      onClick: () => openModal(HOST_REBOOT, {}),
    },
  ];
};
