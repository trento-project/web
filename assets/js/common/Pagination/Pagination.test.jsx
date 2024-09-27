import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { noop } from 'lodash';
import Pagination, { PageStats } from '.';

const NEXT = 'next-page';
const PREV = 'prev-page';
const FIRST = 'first-page';
const LAST = 'last-page';

describe('Pagination component', () => {
  it('should render', () => {
    render(<Pagination hasNext onSelect={noop} />);

    expect(screen.getByLabelText(PREV)).toBeInTheDocument();
    expect(screen.getByLabelText(NEXT)).toBeInTheDocument();
    expect(screen.getByLabelText(LAST)).toBeInTheDocument();
    expect(screen.getByLabelText(FIRST)).toBeInTheDocument();
  });

  it('should render with PageStats', () => {
    render(
      <Pagination
        hasNext
        onSelect={noop}
        pageStats={
          <PageStats
            selectedPage={1}
            itemsPresent={10}
            itemsTotal={13}
            currentItemsPerPage={10}
          />
        }
      />
    );
    expect(screen.queryByText('Showing', { exact: false })).toBeInTheDocument();
  });

  it('should call onSelect', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    render(<Pagination onSelect={onSelect} />);

    await act(() => user.click(screen.getByLabelText(PREV)));
    expect(onSelect).toHaveBeenCalledWith('prev');
    expect(onSelect).toHaveBeenCalledTimes(1);
    onSelect.mockClear();

    await act(() => user.click(screen.getByLabelText(NEXT)));
    expect(onSelect).toHaveBeenCalledWith('next');
    expect(onSelect).toHaveBeenCalledTimes(1);
    onSelect.mockClear();

    await act(() => user.click(screen.getByLabelText(FIRST)));
    expect(onSelect).toHaveBeenCalledWith('first');
    expect(onSelect).toHaveBeenCalledTimes(1);
    onSelect.mockClear();

    await act(() => user.click(screen.getByLabelText(LAST)));
    expect(onSelect).toHaveBeenCalledWith('last');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should disable prev button', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    render(<Pagination hasPrev={false} onSelect={onSelect} />);

    await act(() => user.click(screen.getByLabelText(PREV)));
    expect(onSelect).not.toHaveBeenCalled();

    await act(() => user.click(screen.getByLabelText(NEXT)));
    expect(onSelect).toHaveBeenCalledWith('next');
    expect(onSelect).toHaveBeenCalledTimes(1);
    onSelect.mockClear();
  });

  it('should disable next button', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    render(<Pagination hasNext={false} onSelect={onSelect} />);

    await act(() => user.click(screen.getByLabelText(NEXT)));
    expect(onSelect).not.toHaveBeenCalled();
    onSelect.mockClear();

    await act(() => user.click(screen.getByLabelText(PREV)));
    expect(onSelect).toHaveBeenCalledWith('prev');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should disable first button', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    render(<Pagination hasPrev={false} onSelect={onSelect} />);

    await act(() => user.click(screen.getByLabelText(FIRST)));
    expect(onSelect).not.toHaveBeenCalled();

    await act(() => user.click(screen.getByLabelText(LAST)));
    expect(onSelect).toHaveBeenCalledWith('last');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should disable last button', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    render(<Pagination hasNext={false} onSelect={onSelect} />);

    await act(() => user.click(screen.getByLabelText(LAST)));
    expect(onSelect).not.toHaveBeenCalled();

    await act(() => user.click(screen.getByLabelText(FIRST)));
    expect(onSelect).toHaveBeenCalledWith('first');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
