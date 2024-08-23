import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { noop } from 'lodash';
import Pagination from '.';

describe('Pagination component', () => {
  it('should render', () => {
    render(
      <Pagination
        pages={5}
        currentPage={1}
        currentItemsPerPage={10}
        itemsPerPageOptions={[10, 20, 50]}
        onSelect={noop}
        onChangeItemsPerPage={noop}
      />
    );
    expect(screen.getByText('Results per page')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    for (let i = 1; i <= 5; i += 1) {
      expect(screen.getByText(`${i}`)).toBeInTheDocument();
    }
    expect(screen.queryByText('6')).not.toBeInTheDocument();
  });

  it('should select the correct page', async () => {
    const user = userEvent.setup();

    const onSelect = jest.fn();
    render(
      <Pagination
        pages={5}
        currentPage={1}
        currentItemsPerPage={10}
        itemsPerPageOptions={[10, 20, 50]}
        onSelect={onSelect}
        onChangeItemsPerPage={noop}
      />
    );

    for (let i = 1; i <= 5; i += 1) {
      // This includes the current page, too. Is it expected?
      // eslint-disable-next-line no-await-in-loop
      await act(() => user.click(screen.getByText(`${i}`)));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(i);
      onSelect.mockClear();
    }
  });

  it('should select items per page', async () => {
    const user = userEvent.setup();

    const onChangeItemsPerPage = jest.fn();
    const currentItemsPerPage = 10;
    const itemsPerPageOptions = [10, 20, 50];
    render(
      <Pagination
        pages={5}
        currentPage={1}
        currentItemsPerPage={currentItemsPerPage}
        itemsPerPageOptions={itemsPerPageOptions}
        onSelect={noop}
        onChangeItemsPerPage={onChangeItemsPerPage}
      />
    );

    for (let i = 0; i < itemsPerPageOptions.length; i += 1) {
      // open dropdown
      // eslint-disable-next-line no-await-in-loop
      await act(() => user.click(screen.getByText(`${currentItemsPerPage}`)));

      // select item
      const selection = itemsPerPageOptions[i];
      const [selectable] = screen.getAllByText(`${selection}`).reverse();
      // eslint-disable-next-line no-await-in-loop
      await act(() => user.click(selectable));

      // check if the correct item was selected
      expect(onChangeItemsPerPage).toHaveBeenCalledTimes(1);
      expect(onChangeItemsPerPage).toHaveBeenCalledWith(selection);
      onChangeItemsPerPage.mockClear();
    }
  });
});
