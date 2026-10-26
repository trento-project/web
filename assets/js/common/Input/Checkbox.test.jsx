// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Checkbox from './Checkbox';

describe('Checkbox Component', () => {
  it('renders an unchecked checkbox by default', () => {
    render(<Checkbox />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    expect(checkbox).not.toBePartiallyChecked();
    expect(checkbox).toBeEnabled();
  });

  it('renders a checked checkbox', () => {
    render(<Checkbox checked />);

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('renders an indeterminate checkbox', () => {
    const { rerender } = render(<Checkbox indeterminate />);

    expect(screen.getByRole('checkbox')).toBePartiallyChecked();

    rerender(<Checkbox indeterminate={false} />);

    expect(screen.getByRole('checkbox')).not.toBePartiallyChecked();
  });

  it('passes additional props to the input', () => {
    render(<Checkbox aria-label="Select all rows" className="ml-2" />);

    expect(screen.getByLabelText('Select all rows')).toHaveClass('ml-2');
  });

  it('calls onChange when clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Checkbox onChange={onChange} />);

    await user.click(screen.getByRole('checkbox'));

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Checkbox disabled onChange={onChange} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();

    await user.click(checkbox);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('toggles when used as a controlled component', async () => {
    const user = userEvent.setup();

    function ControlledCheckbox() {
      const [checked, setChecked] = useState(false);

      return (
        <Checkbox
          checked={checked}
          onChange={() => setChecked((prev) => !prev)}
        />
      );
    }

    render(<ControlledCheckbox />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
