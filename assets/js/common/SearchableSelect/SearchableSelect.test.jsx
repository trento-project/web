import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import SearchableSelect from '.';

const options = [
  {
    value: 'Europe/Berlin',
    label: 'Europe/Berlin (GMT+1)',
    searchLabel: 'Europe/Berlin',
  },
  {
    value: 'America/New_York',
    label: 'America/New_York (GMT-5)',
    searchLabel: 'America/New_York',
  },
  {
    value: 'Asia/Tokyo',
    label: 'Asia/Tokyo (GMT+9)',
    searchLabel: 'Asia/Tokyo',
  },
];

describe('SearchableSelect Component', () => {
  it('should render selected value', () => {
    render(
      <SearchableSelect
        options={options}
        value="Europe/Berlin"
        onChange={jest.fn()}
        placeholder="Select timezone..."
      />
    );

    expect(screen.getByText('Europe/Berlin (GMT+1)')).toBeVisible();
  });

  it('should call onChange with option value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <SearchableSelect
        options={options}
        onChange={onChange}
        placeholder="Select timezone..."
      />
    );

    await user.click(screen.getByText('Select timezone...'));
    await user.click(screen.getByText('Asia/Tokyo (GMT+9)'));

    expect(onChange).toHaveBeenCalledWith('Asia/Tokyo');
  });

  it('should filter options by searchLabel by default', async () => {
    const user = userEvent.setup();

    render(
      <SearchableSelect
        options={options}
        onChange={jest.fn()}
        placeholder="Select timezone..."
      />
    );

    await user.click(screen.getByText('Select timezone...'));
    await user.type(screen.getByRole('combobox'), 'new_york');

    expect(screen.getByText('America/New_York (GMT-5)')).toBeVisible();
    expect(screen.queryByText('Asia/Tokyo (GMT+9)')).not.toBeInTheDocument();
  });
});
