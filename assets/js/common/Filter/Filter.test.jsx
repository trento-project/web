import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Filter from '.';

describe('Filter component', () => {
  it('should render the options correctly', async () => {
    const user = userEvent.setup();

    const options = [
      'John Doe',
      'Jane Smith',
      'Michael Scott',
      'Ella Fitzgerald',
    ];

    render(<Filter options={options} title="names" />);

    // options are not rendered initially
    options.forEach((option) => {
      expect(screen.queryByText(option)).not.toBeInTheDocument();
    });

    await act(() =>
      // select a button which text starts with 'Filter '
      // click on the button to open the options
      user.click(screen.getByText(/Filter *.../))
    );

    // assert that the options are rendered
    options.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('should select an option when clicked', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const options = [
      'John Doe',
      'Jane Smith',
      'Michael Scott',
      'Ella Fitzgerald',
    ];

    render(<Filter options={options} title="names" onChange={mockOnChange} />);

    await act(() => user.click(screen.getByText(/Filter *.../)));

    await act(() => user.click(screen.getByText('Michael Scott')));

    expect(mockOnChange).toHaveBeenCalledWith(['Michael Scott']);
  });

  it('should select multiple items', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const options = [
      'John Doe',
      'Jane Smith',
      'Michael Scott',
      'Ella Fitzgerald',
    ];

    const selectedItem = 'Michael Scott';

    render(
      <Filter
        options={options}
        title="names"
        onChange={mockOnChange}
        value={[selectedItem]}
      />
    );

    await act(() => user.click(screen.getByText(selectedItem)));

    await act(() => user.click(screen.getByText('Jane Smith')));

    expect(mockOnChange).toHaveBeenCalledTimes(1);

    expect(mockOnChange).toHaveBeenCalledWith([selectedItem, 'Jane Smith']);
  });

  it('should deselect an item on multiple item selected', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const options = [
      'John Doe',
      'Jane Smith',
      'Michael Scott',
      'Ella Fitzgerald',
    ];

    const selectedItem1 = 'Michael Scott';
    const selectedItem2 = 'Jane Smith';

    render(
      <Filter
        options={options}
        title="names"
        onChange={mockOnChange}
        value={[selectedItem1, selectedItem2]}
      />
    );

    const filterText = [selectedItem1, selectedItem2].join(', ');
    await act(() => user.click(screen.getByText(filterText)));

    await act(() => user.click(screen.getByText('Jane Smith')));

    expect(mockOnChange).toHaveBeenCalledTimes(1);

    expect(mockOnChange).toHaveBeenCalledWith([selectedItem1]);

    // the list of items is still visible
    options.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('should deselect an item on single item selected', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const options = [
      'John Doe',
      'Jane Smith',
      'Michael Scott',
      'Ella Fitzgerald',
    ];

    const selectedItem = 'Michael Scott';

    render(
      <Filter
        options={options}
        title="names"
        onChange={mockOnChange}
        value={[selectedItem]}
      />
    );

    await act(() => user.click(screen.getByText(selectedItem)));

    await act(() => user.click(screen.getAllByText(selectedItem)[1]));

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });
});
