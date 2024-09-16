import React, { act, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { noop } from 'lodash';
import Pagination, { PaginationPrevNext } from '.';

const NEXT = /^>$/;
const PREV = /^<$/;
const FIRST = /^<<$/;
const LAST = /^>>$/;

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
    ${2}        | ${5}  | ${1}
    ${5}        | ${5}  | ${4}
    ${5}        | ${15} | ${4}
    ${15}       | ${99} | ${14}
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
    currentPage | pages
    ${1}        | ${5}
    ${1}        | ${99}
  `(
    'should disable prev button ($pages, $currentPage)',
    async ({ pages, currentPage }) => {
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
      expect(onSelect).not.toHaveBeenCalled();
    }
  );

  it.each`
    currentPage | pages | nextPage
    ${1}        | ${5}  | ${2}
    ${2}        | ${5}  | ${3}
    ${5}        | ${15} | ${6}
    ${15}       | ${99} | ${16}
    ${1}        | ${99} | ${2}
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

  it.each`
    currentPage | pages
    ${5}        | ${5}
    ${99}       | ${99}
  `(
    'should disable next button ($pages, $currentPage)',
    async ({ pages, currentPage }) => {
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
      expect(onSelect).not.toHaveBeenCalled();
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
      { action: `<`, expected: null }, // previous of the first is noop
      { action: `>`, expected: 2 },
      { action: `>`, expected: 3 },
      { action: `>`, expected: null }, // next of the last is noop
      { action: `<`, expected: 2 },
    ];

    for (let i = 0; i < actions.length; i += 1) {
      const { action, expected } = actions[i];
      // eslint-disable-next-line no-await-in-loop
      await act(() => user.click(screen.getByText(action)));
      if (expected === null) {
        expect(onSelect).not.toHaveBeenCalled();
      } else {
        expect(onSelect).toHaveBeenCalledWith(expected);
        expect(onSelect).toHaveBeenCalledTimes(1);
      }
      onSelect.mockClear();
    }
  });

  it.each`
    currentPage | pages | selected
    ${1}        | ${5}  | ${1}
    ${3}        | ${5}  | ${3}
    ${5}        | ${5}  | ${5}
    ${6}        | ${5}  | ${5}
    ${1}        | ${99} | ${1}
    ${21}       | ${99} | ${21}
    ${99}       | ${99} | ${99}
    ${200}      | ${99} | ${99}
  `(
    'should highlight the current page ($pages, $currentPage)',
    ({ pages, currentPage, selected }) => {
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

      expect(screen.getByText(`${selected}`)).toHaveStyle(
        'color: rgb(48 186 120)'
      );
    }
  );
});

describe('PaginationPrevNext component', () => {
  it('should render', () => {
    render(<PaginationPrevNext hasNext onSelect={noop} />);

    expect(screen.getByText(PREV)).toBeInTheDocument();
    expect(screen.getByText(NEXT)).toBeInTheDocument();
    expect(screen.getByText(LAST)).toBeInTheDocument();
    expect(screen.getByText(FIRST)).toBeInTheDocument();
  });

  it('should call onSelect', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    render(<PaginationPrevNext onSelect={onSelect} />);

    await act(() => user.click(screen.getByText(PREV)));
    expect(onSelect).toHaveBeenCalledWith('prev');
    expect(onSelect).toHaveBeenCalledTimes(1);
    onSelect.mockClear();

    await act(() => user.click(screen.getByText(NEXT)));
    expect(onSelect).toHaveBeenCalledWith('next');
    expect(onSelect).toHaveBeenCalledTimes(1);
<<<<<<< HEAD
    onSelect.mockClear();

    await act(() => user.click(screen.getByText(FIRST)));
    expect(onSelect).toHaveBeenCalledWith('first');
    expect(onSelect).toHaveBeenCalledTimes(1);
    onSelect.mockClear();

    await act(() => user.click(screen.getByText(LAST)));
    expect(onSelect).toHaveBeenCalledWith('last');
    expect(onSelect).toHaveBeenCalledTimes(1);
||||||| parent of 4ea5f3f97 (add first and last page button)
=======

    await act(() => user.click(screen.getByText('<<')));
    expect(onSelect).toHaveBeenCalledWith('first');
    expect(onSelect).toHaveBeenCalledTimes(1);

    await act(() => user.click(screen.getByText('>>')));
    expect(onSelect).toHaveBeenCalledWith('last');
    expect(onSelect).toHaveBeenCalledTimes(1);
>>>>>>> 4ea5f3f97 (add first and last page button)
  });

  it('should disable prev button', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    render(<PaginationPrevNext hasPrev={false} onSelect={onSelect} />);

    await act(() => user.click(screen.getByText(PREV)));
    expect(onSelect).not.toHaveBeenCalled();

    await act(() => user.click(screen.getByText(NEXT)));
    expect(onSelect).toHaveBeenCalledWith('next');
    expect(onSelect).toHaveBeenCalledTimes(1);
    onSelect.mockClear();
  });

  it('should disable next button', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    render(<PaginationPrevNext hasNext={false} onSelect={onSelect} />);

    await act(() => user.click(screen.getByText(NEXT)));
    expect(onSelect).not.toHaveBeenCalled();
    onSelect.mockClear();

    await act(() => user.click(screen.getByText(PREV)));
    expect(onSelect).toHaveBeenCalledWith('prev');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
<<<<<<< HEAD

  it('should disable first button', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    render(<PaginationPrevNext hasPrev={false} onSelect={onSelect} />);

    await act(() => user.click(screen.getByText(FIRST)));
    expect(onSelect).not.toHaveBeenCalled();

    await act(() => user.click(screen.getByText(LAST)));
    expect(onSelect).toHaveBeenCalledWith('last');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should disable last button', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    render(<PaginationPrevNext hasNext={false} onSelect={onSelect} />);

    await act(() => user.click(screen.getByText(LAST)));
    expect(onSelect).not.toHaveBeenCalled();

    await act(() => user.click(screen.getByText(FIRST)));
    expect(onSelect).toHaveBeenCalledWith('first');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
||||||| parent of 4ea5f3f97 (add first and last page button)
=======

  it('should disable first button', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    render(<PaginationPrevNext hasPrev={false} onSelect={onSelect} />);

    await act(() => user.click(screen.getByText('<<')));
    expect(onSelect).not.toHaveBeenCalled();

    await act(() => user.click(screen.getByText('>>')));
    expect(onSelect).toHaveBeenCalledWith('last');
    expect(onSelect).toHaveBeenCalledTimes(1);
    onSelect.mockClear();
  });

  it('should disable last button', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    render(<PaginationPrevNext hasNext={false} onSelect={onSelect} />);

    await act(() => user.click(screen.getByText('>>')));
    expect(onSelect).not.toHaveBeenCalled();

    await act(() => user.click(screen.getByText('<<')));
    expect(onSelect).toHaveBeenCalledWith('first');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
>>>>>>> 4ea5f3f97 (add first and last page button)
});
