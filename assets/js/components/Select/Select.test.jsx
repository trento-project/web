import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';
import Select from './Select';

describe('Select Component', () => {
  const scenarios = [
    {
      optionsName: 'foos',
      options: ['foo1', 'foo2', 'foo3'],
      value: 'foo3',
      selectedValue: 'foo3',
      allOptions: ['foo1', 'foo2', 'foo3'],
    },
    {
      optionsName: 'bars',
      options: ['all', 'bar1', 'bar2', 'bar3'],
      value: 'all',
      selectedValue: 'All bars',
      allOptions: ['All bars', 'bar1', 'bar2', 'bar3'],
    },
    {
      optionsName: 'foobars',
      options: ['all', 'foobar1', 'foobar2', 'foobar3'],
      value: 'foobar1',
      selectedValue: 'foobar1',
      allOptions: ['All foobars', 'foobar1', 'foobar2', 'foobar3'],
    },
  ];

  it.each(scenarios)(
    'should render the selected option',
    ({ optionsName, options, value, selectedValue, allOptions }) => {
      render(
        <Select optionsName={optionsName} options={options} value={value} />
      );
      expect(screen.getByRole('button')).toHaveTextContent(selectedValue);

      allOptions
        .filter((option) => option !== selectedValue)
        .forEach((option) => {
          expect(screen.queryByText(option)).not.toBeInTheDocument();
        });
    }
  );

  it.each(scenarios)(
    'should render all the options when opened',
    async ({ optionsName, options, value, selectedValue, allOptions }) => {
      const user = userEvent.setup();
      render(
        <Select optionsName={optionsName} options={options} value={value} />
      );
      await user.click(screen.getByText(selectedValue));

      expect(screen.getAllByText(selectedValue)).toHaveLength(2);

      allOptions
        .filter((option) => option !== selectedValue)
        .forEach((option) => {
          expect(screen.getByText(option)).toBeInTheDocument();
        });
    }
  );

  it('should render options via a custom option renderer', async () => {
    const user = userEvent.setup();
    const options = ['option1', 'option2', 'option3'];

    const optionRenderer = (option) => `custom ${option}`;

    render(
      <Select
        optionsName="foobars"
        options={options}
        value="all"
        renderOption={optionRenderer}
      />
    );

    await user.click(screen.getByText('All foobars'));

    options.forEach((option) => {
      expect(screen.getByText(`custom ${option}`)).toBeInTheDocument();
    });
  });

  it('should notify about a new option being selected', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();

    const options = ['option1', 'option2', 'option3'];

    render(
      <Select
        optionsName="foobars"
        options={options}
        value="all"
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByText('All foobars'));
    await user.click(screen.getByText('option2'));

    expect(mockOnChange).toHaveBeenCalledWith('option2');
  });
});
