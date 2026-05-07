// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import MountpointsChart from './MountpointsChart';

const testMountpoints = {
  '/': {
    device: '/dev/sda1',
    fsType: 'btrfs',
  },
  '/home': {
    device: '/dev/sda2',
    fsType: 'xfs',
  },
  '/boot/efi': {
    device: '/dev/nvme0n1p1',
    fsType: 'vfat',
  },
  '/var/log': {
    device: '/dev/mapper/system-var_log',
    fsType: 'xfs',
  },
};

describe('MountpointsChart', () => {
  it('should display all FS types as filters', () => {
    render(<MountpointsChart mountpoints={testMountpoints} />);

    expect(screen.getByText('btrfs')).toBeInTheDocument();
    const xfsLabels = screen.getAllByText('xfs');
    expect(xfsLabels).toHaveLength(1);
    expect(screen.getByText('vfat')).toBeInTheDocument();
  });

  it('should filter FS types cliking the filter', async () => {
    const user = userEvent.setup();

    render(<MountpointsChart mountpoints={testMountpoints} />);

    const xfsLabel = screen.getByText('xfs');
    expect(xfsLabel).not.toHaveClass('opacity-50');
    await user.click(xfsLabel);
    expect(xfsLabel).toHaveClass('opacity-50');
  });
});
