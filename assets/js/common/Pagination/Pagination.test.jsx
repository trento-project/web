import React, { act, useState } from 'react';
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

  it.each`
    currentPage | pages
    ${1}        | ${5}
    ${2}        | ${5}
    ${5}        | ${5}
    ${5}        | ${15}
    ${15}       | ${99}
    ${1}        | ${99}
    ${99}       | ${99}
  `(
    'should always show first, last and current page ($pages, $currentPage)',
    ({ pages, currentPage }) => {
      render(
        <Pagination
          pages={pages}
          currentPage={currentPage}
          currentItemsPerPage={10}
          itemsPerPageOptions={[10, 20, 50]}
          onSelect={noop}
          onChangeItemsPerPage={noop}
        />
      );

      const firstPage = 1;
      const lastPage = pages;

      expect(screen.getByText(`${firstPage}`)).toBeInTheDocument();
      expect(screen.getByText(`${currentPage}`)).toBeInTheDocument();
      expect(screen.getByText(`${lastPage}`)).toBeInTheDocument();
    }
  );

  it.each`
    currentPage | pages | previousPage
    ${1}        | ${5}  | ${1}
    ${2}        | ${5}  | ${1}
    ${5}        | ${5}  | ${4}
    ${5}        | ${15} | ${4}
    ${15}       | ${99} | ${14}
    ${1}        | ${99} | ${1}
    ${99}       | ${99} | ${98}
  `(
    'should select previous page ($pages, $currentPage)',
    async ({ pages, currentPage, previousPage }) => {
      const user = userEvent.setup();
      const onSelect = jest.fn();

      render(
        <Pagination
          pages={pages}
          currentPage={currentPage}
          currentItemsPerPage={10}
          itemsPerPageOptions={[10, 20, 50]}
          onSelect={onSelect}
          onChangeItemsPerPage={noop}
        />
      );

      await act(() => user.click(screen.getByText(`<`)));
      expect(onSelect).toHaveBeenCalledWith(previousPage);
    }
  );

  it.each`
    currentPage | pages | nextPage
    ${1}        | ${5}  | ${2}
    ${2}        | ${5}  | ${3}
    ${5}        | ${5}  | ${5}
    ${5}        | ${15} | ${6}
    ${15}       | ${99} | ${16}
    ${1}        | ${99} | ${2}
    ${99}       | ${99} | ${99}
  `(
    'should select next page ($pages, $currentPage)',
    async ({ pages, currentPage, nextPage }) => {
      const user = userEvent.setup();
      const onSelect = jest.fn();

      render(
        <Pagination
          pages={pages}
          currentPage={currentPage}
          currentItemsPerPage={10}
          itemsPerPageOptions={[10, 20, 50]}
          onSelect={onSelect}
          onChangeItemsPerPage={noop}
        />
      );

      await act(() => user.click(screen.getByText(`>`)));
      expect(onSelect).toHaveBeenCalledWith(nextPage);
    }
  );

  it('should work correctly as controlled component', async () => {
    const user = userEvent.setup();

    const onSelect = jest.fn();
    const initialPage = 1;

    function ControlledComponent() {
      const [value, setValue] = useState(initialPage);
      return (
        <Pagination
          pages={3}
          currentPage={value}
          currentItemsPerPage={10}
          itemsPerPageOptions={[10, 20, 50]}
          onSelect={(selected) => {
            onSelect(selected);
            setValue(selected);
          }}
          onChangeItemsPerPage={noop}
        />
      );
    }

    render(<ControlledComponent />);

    const actions = [
      { action: `<`, expected: 1 },
      { action: `>`, expected: 2 },
      { action: `>`, expected: 3 },
      { action: `>`, expected: 3 },
      { action: `<`, expected: 2 },
    ];

    for (let i = 0; i < actions.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await act(() => user.click(screen.getByText(actions[i].action)));
      expect(onSelect).toHaveBeenCalledWith(actions[i].expected);
      onSelect.mockClear();
    }
  });
});
