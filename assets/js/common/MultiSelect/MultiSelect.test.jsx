import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';
import MultiSelect from '.';

const options = [
  { value: 1, label: 'Orange', tooltip: 'A nice orange' },
  { value: 2, label: 'Apple', tooltip: 'A nice apple' },
  { value: 3, label: 'Banana', tooltip: 'A nice banana' },
];

describe('MultiSelect Component', () => {
  it('should display options', async () => {
    const user = userEvent.setup();

    render(<MultiSelect options={options} />);

    await user.click(screen.getByText('Select...'));
    options.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeVisible();
    });
  });

  it('should display initial values', () => {
    const values = options.slice(0, 1);

    render(<MultiSelect options={options} values={values} />);

    expect(screen.getByText(values[0].label)).toBeVisible();
  });

  it('should disable the component', () => {
    render(<MultiSelect options={options} disabled />);

    const disabled = document.querySelector('[aria-disabled="true"]');

    expect(disabled).toBeInTheDocument();
  });

  it('should change the values', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();

    render(<MultiSelect options={options} onChange={mockOnChange} />);

    await user.click(screen.getByText('Select...'));
    await user.click(screen.getByText(options[0].label));

    expect(mockOnChange).toHaveBeenCalledWith(
      options.slice(0, 1),
      expect.anything()
    );

    await user.click(screen.getByText(options[0].label));
    await user.click(screen.getByText(options[1].label));

    expect(mockOnChange).toHaveBeenCalledWith(
      options.slice(0, 2),
      expect.anything()
    );

    const deleteIcons = screen.getAllByRole('button');
    await user.click(deleteIcons[0]);

    expect(mockOnChange).toHaveBeenCalledWith(
      options.slice(1, 2),
      expect.anything()
    );

    const deleteAll = document.querySelector('[data-slot="icon"]');
    await user.click(deleteAll);

    expect(mockOnChange).toHaveBeenCalledWith([], expect.anything());
    expect(screen.getByText('Select...')).toBeVisible();
  });
});
