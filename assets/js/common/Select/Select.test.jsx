import React from 'react';
import { render, screen } from '@testing-library/react';
import { find } from 'lodash';
import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';
import Select, { createOptionRenderer, createSelectedOptionFetcher } from '.';

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
      selectedValue: 'all',
      allOptions: ['all', 'bar1', 'bar2', 'bar3'],
    },
    {
      optionsName: 'foobars',
      options: ['all', 'foobar1', 'foobar2', 'foobar3'],
      value: 'foobar1',
      selectedValue: 'foobar1',
      allOptions: ['all', 'foobar1', 'foobar2', 'foobar3'],
    },
    {
      optionsName: 'structured options',
      options: [
        { value: 'all' },
        { value: 'structured option 1' },
        { value: 'structured option 2' },
        { value: 'structured option 3' },
      ],
      value: 'structured option 1',
      selectedValue: 'structured option 1',
      allOptions: [
        'all',
        'structured option 1',
        'structured option 2',
        'structured option 3',
      ],
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

    const optionRenderer = createOptionRenderer(
      'All foobars',
      (option) => `custom ${option}`
    );

    render(
      <Select
        optionsName="foobars"
        options={['all', ...options]}
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
        value="option1"
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByText('option1'));
    await user.click(screen.getByText('option2'));

    expect(mockOnChange).toHaveBeenCalledWith('option2');
  });

  it('should render a disabled select', async () => {
    const user = userEvent.setup();

    const options = ['option1', 'option2', 'option3'];

    render(
      <Select
        optionsName="foobars"
        options={options}
        value="option1"
        disabled
      />
    );

    expect(screen.getByRole('button')).toBeDisabled();

    await user.click(screen.getByText('option1'));
    expect(screen.queryByText('option2')).not.toBeInTheDocument();
  });

  it('should render disabled options', async () => {
    const user = userEvent.setup();

    const options = [
      'all',
      { value: 'option1', disabled: true },
      'option2',
      'option3',
    ];

    render(<Select optionsName="foobars" options={options} value="all" />);

    await user.click(screen.getByText('all'));
    expect(screen.getByText('option1').parentNode).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByText('option3').parentNode).not.toHaveAttribute(
      'aria-disabled'
    );
  });

  it('should render the selected option via a custom fetcher', async () => {
    const options = [
      {
        value: { foo: 'foo1', bar: 'bar1' },
        key: 'foo1-bar1',
      },
      {
        value: { foo: 'foo2', bar: 'bar2' },
        key: 'foo2-bar2',
      },
      {
        value: { foo: 'foo3', bar: 'bar3' },
        key: 'foo3-bar3',
      },
    ];

    const renderOption = createOptionRenderer(
      'All foobars',
      ({ foo, bar }) => `custom ${foo} ${bar}`
    );

    const fetchSelectedOption = createSelectedOptionFetcher(
      (availableOptions, { foo, bar }) =>
        find(availableOptions, { key: `${foo}-${bar}` })
    );

    render(
      <Select
        optionsName="foobars"
        options={options}
        value={{ foo: 'foo2', bar: 'bar2' }}
        renderOption={renderOption}
        fetchSelectedOption={fetchSelectedOption}
      />
    );

    expect(screen.getByRole('button')).toHaveTextContent('custom foo2 bar2');
  });
});
