import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { format } from 'date-fns';
import DateFilter from '.';

function as_localtime_str(utc_timestamp) {
  return format(new Date(utc_timestamp), "yyyy-MM-dd'T'HH:mm:ss");
}

describe('DateFilter component', () => {
  it('should render with pre-configured options', async () => {
    const user = userEvent.setup();

    render(<DateFilter title="by date" prefilled onChange={jest.fn()} />);

    const placeholder = 'Filter by date...';

    // Assert that the title is rendered
    expect(screen.getByText(placeholder)).toBeInTheDocument();

    await act(() => user.click(screen.getByText(placeholder)));

    // Assert that the options are rendered
    ['1h ago', '24h ago', '7d ago', '30d ago'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should select an option when clicked', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();

    render(<DateFilter title="by date" prefilled onChange={mockOnChange} />);

    await act(() => user.click(screen.getByText('Filter by date...')));

    await act(() => user.click(screen.getByText('24h ago')));

    expect(mockOnChange).toHaveBeenCalledWith(['24h ago', expect.any(Date)]);
  });

  it("should render the selected option's label when providing a string", async () => {
    render(
      <DateFilter
        title="by date"
        prefilled
        value="24h ago"
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText('24h ago')).toBeInTheDocument();
  });

  it("should render the selected option's label when providing an array", async () => {
    render(
      <DateFilter
        title="by date"
        prefilled
        value={['24h ago', new Date()]}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText('24h ago')).toBeInTheDocument();
  });

  it('should render custom option ', async () => {
    const user = userEvent.setup();

    render(
      <DateFilter
        title="by date"
        options={[
          ['Custom', () => new Date(Date.now() - 42 * 24 * 60 * 60 * 1000)],
        ]}
        prefilled
        onChange={jest.fn()}
      />
    );

    await act(() => user.click(screen.getByText('Filter by date...')));

    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it.each`
    option                                                  | labelToFind
    ${'Custom'}                                             | ${'Custom'}
    ${['Custom', 'invalid' /* not a function */]}           | ${'Custom'}
    ${['Custom', () => 'invalid' /* not returning date */]} | ${'Custom'}
    ${['Custom', () => undefined /* not returning date */]} | ${'Custom'}
    ${['Custom', () => null /* not returning date */]}      | ${'Custom'}
  `('should not render malformed options', async ({ option, labelToFind }) => {
    const user = userEvent.setup();

    render(
      <DateFilter
        title="by date"
        options={[option]}
        prefilled={false}
        onChange={jest.fn()}
      />
    );

    await act(() => user.click(screen.getByText('Filter by date...')));

    expect(screen.queryByText(labelToFind)).not.toBeInTheDocument();
  });

  it('should render overridden option', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const anyDate = new Date(1986, 0, 24);

    render(
      <DateFilter
        title="by date"
        options={[['30d ago', () => anyDate, () => 'my overridden item']]}
        prefilled
        onChange={mockOnChange}
      />
    );

    await act(() => user.click(screen.getByText('Filter by date...')));
    await act(() => user.click(screen.getByText('my overridden item')));

    expect(mockOnChange).toHaveBeenCalledWith(['30d ago', anyDate]);
  });

  it('should select a custom date when typed into the input field', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const { container } = render(
      <DateFilter title="by date" prefilled onChange={mockOnChange} />
    );
    await act(() => user.click(screen.getByText('Filter by date...')));
    const input = container.querySelector('input[type="datetime-local"]');
    await act(() => user.type(input, '2024-08-14T10:21'));

    expect(mockOnChange).toHaveBeenCalledWith([
      'custom',
      new Date(Date.UTC(2024, 8 - 1, 14, 10, 21)),
    ]);
  });

  it.each`
    value                                                     | expected
    ${new Date(Date.UTC(2024, 8 - 1, 14, 15, 21))}            | ${'08/14/2024 03:21:00 PM'}
    ${as_localtime_str(Date.UTC(2021, 1 - 1, 24, 5, 50, 23))} | ${'01/24/2021 05:50:23 AM'}
    ${'2021-01-24T05:50:23.000Z'}                             | ${'01/24/2021 05:50:23 AM'}
  `('should render the custom date ($value)', async ({ value, expected }) => {
    const mockOnChange = jest.fn();

    render(
      <DateFilter
        title="by date"
        value={['custom', value]}
        prefilled
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
