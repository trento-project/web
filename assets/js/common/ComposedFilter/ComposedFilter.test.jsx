import React, { useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ComposedFilter from '.';

jest.setTimeout(100000);
describe('ComposedFilter component', () => {
  it('should render the specified filters', async () => {
    const filters = [
      {
        key: 'filter1',
        type: 'select',
        title: 'Pasta',
        options: ['Carbonara', 'Amatriciana', 'Ajo & Ojo', 'Gricia'],
      },
      {
        key: 'filter2',
        type: 'select',
        title: 'Pizza',
        options: ['Margherita', 'Marinara', 'Diavola', 'Bufalina'],
      },
      {
        key: 'filter3',
        type: 'search_box',
        title: 'Frutta',
        placeholder: 'Filter by frutta',
      },
    ];

    render(<ComposedFilter filters={filters} />);

    expect(screen.getByText('Filter Pasta...')).toBeInTheDocument();
    expect(screen.getByText('Filter Pizza...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter by frutta')).toBeInTheDocument();
  });

  it('should select value', async () => {
    const filters = [
      {
        key: 'filter1',
        type: 'select',
        title: 'Pasta',
        options: ['Carbonara', 'Amatriciana', 'Ajo & Ojo', 'Gricia'],
      },
      {
        key: 'filter2',
        type: 'select',
        title: 'Pizza',
        options: ['Margherita', 'Marinara', 'Diavola', 'Bufalina'],
      },
      {
        key: 'filter3',
        type: 'search_box',
        title: 'Frutta',
      },
    ];

    const value = {
      filter1: ['Carbonara', 'Gricia'],
      filter2: ['Diavola'],
      filter3: 'Papaya',
    };

    render(<ComposedFilter filters={filters} value={value} />);

    expect(screen.getByText('Carbonara, Gricia')).toBeInTheDocument();
    expect(screen.getByText('Diavola')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Papaya')).toBeInTheDocument();
  });

  it('should change selected value', async () => {
    const filters = [
      {
        key: 'filter1',
        type: 'select',
        title: 'Pasta',
        options: ['Carbonara', 'Amatriciana', 'Ajo & Ojo', 'Gricia'],
      },
      {
        key: 'filter2',
        type: 'select',
        title: 'Pizza',
        options: ['Margherita', 'Marinara', 'Diavola', 'Bufalina'],
      },
      {
        key: 'filter3',
        type: 'search_box',
        title: 'Frutta',
        placeholder: 'Filter by frutta',
      },
    ];

    const initialValue = {
      filter1: ['Carbonara', 'Gricia'],
      filter2: ['Diavola'],
      filter3: 'Banana',
    };

    const nextValue = {};

    function ControlledComponent() {
      const [value, setValue] = useState(initialValue);

      return (
        <>
          <button
            type="button"
            onClick={() => {
              setValue(nextValue);
            }}
          >
            Click me
          </button>
          <ComposedFilter filters={filters} value={value} autoApply />
        </>
      );
    }

    render(<ControlledComponent />);

    expect(screen.getByText('Carbonara, Gricia')).toBeInTheDocument();
    expect(screen.getByText('Diavola')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Banana')).toBeInTheDocument();

    await act(() => userEvent.click(screen.getByText('Click me')));

    expect(screen.getByText('Filter Pasta...')).toBeInTheDocument();
    expect(screen.getByText('Filter Pizza...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter by frutta')).toBeInTheDocument();
  });

  it('should call onChange once for each selection when a filter is changed and it is applied automatically', async () => {
    const mockOnChange = jest.fn();
    const filters = [
      {
        key: 'filter1',
        type: 'select',
        title: 'Pasta',
        options: ['Carbonara', 'Amatriciana', 'Ajo & Ojo', 'Gricia'],
      },
      {
        key: 'filter2',
        type: 'select',
        title: 'Pizza',
        options: ['Margherita', 'Marinara', 'Diavola', 'Bufalina'],
      },
      {
        key: 'filter3',
        type: 'search_box',
        title: 'Frutta',
        placeholder: 'Filter by frutta',
      },
    ];

    render(
      <ComposedFilter filters={filters} onChange={mockOnChange} autoApply />
    );

    // select Carbonara and Gricia from pasta filter
    await act(() => userEvent.click(screen.getByText('Filter Pasta...')));
    await act(() => userEvent.click(screen.getByText('Carbonara')));
    await act(() => userEvent.click(screen.getByText('Gricia')));
    await act(() => userEvent.click(screen.getByText('Carbonara, Gricia')));

    // select Diavola from pizza filter
    await act(() => userEvent.click(screen.getByText('Filter Pizza...')));
    await act(() => userEvent.click(screen.getByText('Diavola')));
    await act(() => userEvent.click(screen.getAllByText('Diavola')[0]));

    // type a query in the search box
    await act(() =>
      userEvent.type(
        screen.getByPlaceholderText('Filter by frutta'),
        'Dragonfruit'
      )
    );

    expect(mockOnChange).toHaveBeenCalledTimes(14);
    expect(mockOnChange).toHaveBeenNthCalledWith(1, { filter1: ['Carbonara'] });
    expect(mockOnChange).toHaveBeenNthCalledWith(2, {
      filter1: ['Carbonara', 'Gricia'],
    });
    expect(mockOnChange).toHaveBeenNthCalledWith(3, {
      filter1: ['Carbonara', 'Gricia'],
      filter2: ['Diavola'],
    });
    expect(mockOnChange).toHaveBeenNthCalledWith(10, {
      filter1: ['Carbonara', 'Gricia'],
      filter2: ['Diavola'],
      filter3: 'Dragonf',
    });
    expect(mockOnChange).toHaveBeenNthCalledWith(14, {
      filter1: ['Carbonara', 'Gricia'],
      filter2: ['Diavola'],
      filter3: 'Dragonfruit',
    });
  });

  it('should call onChange when a filter is changed and it is explicitly applied', async () => {
    const mockOnChange = jest.fn();
    const filters = [
      {
        key: 'filter1',
        type: 'select',
        title: 'Pasta',
        options: ['Carbonara', 'Amatriciana', 'Ajo & Ojo', 'Gricia'],
      },
      {
        key: 'filter2',
        type: 'select',
        title: 'Pizza',
        options: ['Margherita', 'Marinara', 'Diavola', 'Bufalina'],
      },
      {
        key: 'filter3',
        type: 'search_box',
        title: 'Frutta',
        placeholder: 'Filter by frutta',
      },
    ];

    render(<ComposedFilter filters={filters} onChange={mockOnChange} />);

    // select Carbonara and Gricia from pasta filter
    await act(() => userEvent.click(screen.getByText('Filter Pasta...')));
    await act(() => userEvent.click(screen.getByText('Carbonara')));
    await act(() => userEvent.click(screen.getByText('Gricia')));
    await act(() => userEvent.click(screen.getByText('Carbonara, Gricia')));

    // select Diavola from pizza filter
    await act(() => userEvent.click(screen.getByText('Filter Pizza...')));
    await act(() => userEvent.click(screen.getByText('Diavola')));
    await act(() => userEvent.click(screen.getAllByText('Diavola')[0]));

    // type a query in the search box
    await act(() =>
      userEvent.type(
        screen.getByPlaceholderText('Filter by frutta'),
        'Dragonfruit'
      )
    );

    // not applied yet
    expect(mockOnChange).not.toHaveBeenCalled();

    // apply
    await act(() => userEvent.click(screen.getByText('Apply Filter')));

    // after apply
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith({
      filter1: ['Carbonara', 'Gricia'],
      filter2: ['Diavola'],
      filter3: 'Dragonfruit',
    });
  });

  it('should call reset filters', async () => {
    const mockOnChange = jest.fn();
    const filters = [
      {
        key: 'filter1',
        type: 'select',
        title: 'Pasta',
        options: ['Carbonara', 'Amatriciana', 'Ajo & Ojo', 'Gricia'],
      },
      {
        key: 'filter2',
        type: 'select',
        title: 'Pizza',
        options: ['Margherita', 'Marinara', 'Diavola', 'Bufalina'],
      },
      {
        key: 'filter3',
        type: 'search_box',
        title: 'Frutta',
        placeholder: 'Filter by frutta',
      },
    ];

    render(<ComposedFilter filters={filters} onChange={mockOnChange} />);

    // select Carbonara and Gricia from pasta filter
    await act(() => userEvent.click(screen.getByText('Filter Pasta...')));
    await act(() => userEvent.click(screen.getByText('Carbonara')));
    await act(() => userEvent.click(screen.getByText('Gricia')));
    await act(() => userEvent.click(screen.getByText('Carbonara, Gricia')));

    // select Diavola from pizza filter
    await act(() => userEvent.click(screen.getByText('Filter Pizza...')));
    await act(() => userEvent.click(screen.getByText('Diavola')));
    await act(() => userEvent.click(screen.getAllByText('Diavola')[0]));

    // type a query in the search box
    await act(() =>
      userEvent.type(
        screen.getByPlaceholderText('Filter by frutta'),
        'Dragonfruit'
      )
    );

    await act(() => userEvent.click(screen.getByText('Reset Filters')));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith({});

    // filters are reset
    expect(screen.getByText('Filter Pasta...')).toBeInTheDocument();
    expect(screen.getByText('Filter Pizza...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter by frutta')).toBeInTheDocument();
  });
});
