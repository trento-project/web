import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { map } from 'lodash';

import userEvent from '@testing-library/user-event';
import Select, { createOptionRenderer } from '.';

const options = [
  { value: 1, label: 'Orange', tooltip: 'A nice orange' },
  { value: 2, label: 'Apple', tooltip: 'A nice apple' },
  { value: 3, label: 'Banana', tooltip: 'A nice banana' },
];

describe('Select Component', () => {
  it('should display options', async () => {
    const user = userEvent.setup();

    render(<Select options={options} />);

    await user.click(screen.getByText('Select...'));
    options.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeVisible();
    });
  });

  it('should display options using simple strings', async () => {
    const user = userEvent.setup();
    const simpleOptions = ['Orange', 'Apple'];

    render(<Select options={simpleOptions} />);

    await user.click(screen.getByText('Select...'));
    simpleOptions.forEach((opt) => {
      expect(screen.getByText(opt)).toBeVisible();
    });
  });

  it('should display initial single value', () => {
    render(<Select options={options} values={[options[0]]} />);

    expect(screen.getByText(options[0].label)).toBeVisible();
  });

  it('should display initial values in multi-select option', () => {
    const values = options.slice(0, 1);

    render(<Select options={options} values={values} isMulti />);

    expect(screen.getByText(values[0].label)).toBeVisible();
  });

  it('should disable the component', () => {
    render(<Select options={options} isDisabled />);

    const disabled = document.querySelector('[aria-disabled="true"]');

    expect(disabled).toBeInTheDocument();
  });

  it('should change single value', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();

    render(<Select options={options} onChange={mockOnChange} />);

    await user.click(screen.getByText('Select...'));
    await user.click(screen.getByText(options[0].label));

    expect(mockOnChange).toHaveBeenCalledWith(options[0].value);
  });

  it('should change the values in a multi select option', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();

    render(<Select options={options} onChange={mockOnChange} isMulti />);

    await user.click(screen.getByText('Select...'));
    await user.click(screen.getByText(options[0].label));

    expect(mockOnChange).toHaveBeenCalledWith(
      map(options.slice(0, 1), 'value')
    );

    await user.click(screen.getByText(options[0].label));
    await user.click(screen.getByText(options[1].label));

    expect(mockOnChange).toHaveBeenCalledWith(
      map(options.slice(0, 2), 'value')
    );

    const deleteIcons = screen.getAllByRole('button');
    await user.click(deleteIcons[0]);

    expect(mockOnChange).toHaveBeenCalledWith(
      map(options.slice(1, 2), 'value')
    );

    const deleteAll = document.querySelector('[data-slot="icon"]');
    await user.click(deleteAll);

    expect(mockOnChange).toHaveBeenCalledWith([]);
    expect(screen.getByText('Select...')).toBeVisible();
  });

  it('should render disabled options', async () => {
    const user = userEvent.setup();

    const optionsWithDisabled = [
      'all',
      { label: 'option1', value: 'option1', isDisabled: true },
      'option2',
      'option3',
    ];

    render(<Select options={optionsWithDisabled} values={['all']} />);

    await user.click(screen.getByText('all'));
    expect(screen.getByText('option1')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByText('option3')).toHaveAttribute(
      'aria-disabled',
      'false'
    );
  });

  it('should render options via a custom option renderer', async () => {
    const user = userEvent.setup();
    const simpleOptions = ['option1', 'option2', 'option3'];

    const optionRenderer = createOptionRenderer(
      'All foobars',
      (option) => `custom ${option}`
    );

    render(
      <Select
        optionsName="foobars"
        options={['all', ...simpleOptions]}
        values={['all']}
        renderOption={optionRenderer}
      />
    );

    await user.click(screen.getByText('All foobars'));

    simpleOptions.forEach((option) => {
      expect(screen.getByText(`custom ${option}`)).toBeInTheDocument();
    });
  });
});
