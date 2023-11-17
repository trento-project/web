import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';
import Select from './Select';

describe('Select Component', () => {
  it('should render the `all options` option as selected', () => {
    const options = ['option1', 'option2', 'option3'];
    render(<Select optionsName="foobars" options={options} selected="all" />);

    options.forEach((option) => {
      expect(screen.queryByText(option)).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button')).toHaveTextContent('All foobars');
  });

  const someOptions = ['option1', 'option2', 'option3'];
  it.each(someOptions)(
    'should render the selected option',
    (selectedOption) => {
      render(
        <Select
          optionsName="foobars"
          options={someOptions}
          selected={selectedOption}
        />
      );

      someOptions
        .filter((option) => option !== selectedOption)
        .forEach((notSelectedOption) => {
          expect(screen.queryByText(notSelectedOption)).not.toBeInTheDocument();
        });
      expect(screen.getByRole('button')).toHaveTextContent(selectedOption);
    }
  );

  it('should render the options when clicked', async () => {
    const user = userEvent.setup();
    const options = ['option1', 'option2', 'option3'];

    render(<Select optionsName="foobars" options={options} selected="all" />);

    expect(screen.getByRole('button')).toHaveTextContent('All foobars');

    await user.click(screen.getByText('All foobars'));

    expect(screen.getAllByText('All foobars')).toHaveLength(2);

    options.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('should render options via a custom option renderer', async () => {
    const user = userEvent.setup();
    const options = ['option1', 'option2', 'option3'];

    const optionRenderer = (option) => `custom ${option}`;

    render(
      <Select
        optionsName="foobars"
        options={options}
        selected="all"
        optionRenderer={optionRenderer}
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
        selected="all"
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByText('All foobars'));
    await user.click(screen.getByText('option2'));

    expect(mockOnChange).toHaveBeenCalledWith('option2');
  });
});
