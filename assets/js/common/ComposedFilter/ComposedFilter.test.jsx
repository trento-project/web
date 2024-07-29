import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ComposedFilter from '.';

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
    ];

    render(<ComposedFilter filters={filters} />);

    expect(screen.getByText('Filter Pasta...')).toBeInTheDocument();
    expect(screen.getByText('Filter Pizza...')).toBeInTheDocument();
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

    expect(mockOnChange).toHaveBeenCalledTimes(3);
    expect(mockOnChange).toHaveBeenNthCalledWith(1, { filter1: ['Carbonara'] });
    expect(mockOnChange).toHaveBeenNthCalledWith(2, {
      filter1: ['Carbonara', 'Gricia'],
    });
    expect(mockOnChange).toHaveBeenNthCalledWith(3, {
      filter1: ['Carbonara', 'Gricia'],
      filter2: ['Diavola'],
    });
  });

  it('should call onChange when a filter is changed and it is applied automatically', async () => {
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

    // not applied yet
    expect(mockOnChange).not.toHaveBeenCalled();

    // apply
    await act(() => userEvent.click(screen.getByText('Apply')));

    // after apply
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith({
      filter1: ['Carbonara', 'Gricia'],
      filter2: ['Diavola'],
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

    await act(() => userEvent.click(screen.getByText('Reset')));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith({});

    // filters are reset
    expect(screen.getByText('Filter Pasta...')).toBeInTheDocument();
    expect(screen.getByText('Filter Pizza...')).toBeInTheDocument();
  });
});
