// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ChecksFrequencyInput from './ChecksFrequencyInput';

describe('ChecksFrequencyInput', () => {
  it('should show the value and the unit of an interval', () => {
    render(<ChecksFrequencyInput value={360} />);

    expect(screen.getByText('6')).toBeVisible();
    expect(screen.getByText('Hours')).toBeVisible();
  });

  it('should change the value within the unit', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<ChecksFrequencyInput value={15} onChange={onChange} />);

    await user.click(screen.getByText('15'));
    await user.click(screen.getByRole('option', { name: '30' }));

    expect(onChange).toHaveBeenCalledWith(30);
  });

  it('should pick the first value of a new unit', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<ChecksFrequencyInput value={15} onChange={onChange} />);

    await user.click(screen.getByText('Minutes'));
    await user.click(screen.getByRole('option', { name: 'Weeks' }));

    expect(onChange).toHaveBeenCalledWith(10080);
  });

  it('should offer the system setting when allowed', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <ChecksFrequencyInput
        value={null}
        allowSystemSetting
        onChange={onChange}
      />
    );

    expect(screen.getByText('System setting')).toBeVisible();

    await user.click(screen.getByText('System setting'));
    await user.click(screen.getByRole('option', { name: 'Minutes' }));

    expect(onChange).toHaveBeenCalledWith(5);
  });
});
