// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ChecksFrequencyInput from './ChecksFrequencyInput';

describe('ChecksFrequencyInput', () => {
  it('should show an interval as a value and a unit and change it', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<ChecksFrequencyInput value="15m" onChange={onChange} />);

    expect(screen.getByText('15')).toBeVisible();
    expect(screen.getByText('Minutes')).toBeVisible();

    await user.click(screen.getByText('15'));
    await user.click(screen.getByRole('option', { name: '30' }));
    expect(onChange).toHaveBeenLastCalledWith('30m');

    await user.click(screen.getByText('Minutes'));
    await user.click(screen.getByRole('option', { name: 'Hours' }));
    expect(onChange).toHaveBeenLastCalledWith('1h');
  });

  it('should disable periodic executions', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<ChecksFrequencyInput value="1w" onChange={onChange} />);

    await user.click(screen.getByText('Weeks'));
    await user.click(screen.getByRole('option', { name: 'Disabled' }));
    expect(onChange).toHaveBeenLastCalledWith('disabled');
  });

  it('should offer the system setting to a target', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    const { rerender } = render(
      <ChecksFrequencyInput
        value={null}
        allowSystemSetting
        onChange={onChange}
      />
    );

    expect(screen.getByText('System setting')).toBeVisible();
    expect(screen.queryByLabelText('Frequency value')).not.toBeInTheDocument();

    rerender(
      <ChecksFrequencyInput
        value="disabled"
        allowSystemSetting
        onChange={onChange}
      />
    );

    await user.click(screen.getByText('Disabled'));
    await user.click(screen.getByRole('option', { name: 'System setting' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});
