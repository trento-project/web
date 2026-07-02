// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DEFAULT_TIMEZONE, parseDateTimeLocalToUtc } from '@lib/timezones';
import DateFilter from '.';

describe('DateFilter component', () => {
  it('should render with pre-configured options', async () => {
    const user = userEvent.setup();

    render(<DateFilter title="by date" prefilled onChange={jest.fn()} />);

    const placeholder = 'Filter by date...';

    // Assert that the title is rendered
    expect(screen.getByText(placeholder)).toBeInTheDocument();

    await user.click(screen.getByText(placeholder));

    // Assert that the options are rendered
    ['1h ago', '24h ago', '7d ago', '30d ago'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should select an option when clicked', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();

    render(<DateFilter title="by date" prefilled onChange={mockOnChange} />);

    await user.click(screen.getByText('Filter by date...'));

    await user.click(screen.getByText('24h ago'));

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

  it('should render custom option', async () => {
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

    await user.click(screen.getByText('Filter by date...'));

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

    await user.click(screen.getByText('Filter by date...'));

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

    await user.click(screen.getByText('Filter by date...'));
    await user.click(screen.getByText('my overridden item'));

    expect(mockOnChange).toHaveBeenCalledWith(['30d ago', anyDate]);
  });

  it('should select a custom date when typed into the input field', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const timezone = DEFAULT_TIMEZONE;
    const datetime = '2024-08-14T10:21';
    const { container } = render(
      <DateFilter
        title="by date"
        prefilled
        onChange={mockOnChange}
        timezone={timezone}
      />
    );
    await user.click(screen.getByText('Filter by date...'));
    const input = container.querySelector('input[type="datetime-local"]');
    await user.click(input);
    await user.clear(input);
    await user.type(input, datetime);

    const expectedDate = parseDateTimeLocalToUtc(datetime, timezone);

    expect(mockOnChange).toHaveBeenCalledWith(['custom', expectedDate]);
  });

  it('should select a custom date with custom timezone when typed into the input field', async () => {
    const user = userEvent.setup();
    const timezone = 'Pacific/Kiritimati';
    const datetime = '2024-03-31T03:30';
    const mockOnChange = jest.fn();
    const { container } = render(
      <DateFilter
        title="by date"
        prefilled
        onChange={mockOnChange}
        timezone={timezone}
      />
    );

    await user.click(screen.getByText('Filter by date...'));
    const input = container.querySelector('input[type="datetime-local"]');
    await user.click(input);
    await user.clear(input);
    await user.type(input, datetime);

    const expectedDate = parseDateTimeLocalToUtc(datetime, timezone);

    expect(mockOnChange).toHaveBeenCalledWith(['custom', expectedDate]);
  });

  it('leaves the custom input empty until focused, then fills the current time so a date-only calendar pick still applies the filter (Firefox)', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2024-08-14T10:21:00Z').getTime());

    try {
      const mockOnChange = jest.fn();
      const { container } = render(
        <DateFilter
          title="by date"
          prefilled
          onChange={mockOnChange}
          timezone={DEFAULT_TIMEZONE}
        />
      );

      await user.click(screen.getByText('Filter by date...'));
      const input = container.querySelector('input[type="datetime-local"]');

      // No default selection: the field is empty when the dropdown opens.
      expect(input.value).toBe('');

      // Focusing the field (before its native calendar opens) fills in the current
      // time, so the time sub-fields are no longer empty. This is what lets a
      // date-only pick work in Firefox, whose calendar does not auto-fill the time
      // (unlike Chrome/Brave).
      await user.click(input);
      expect(input.value).toBe('2024-08-14T10:21');

      // Clear and type the new date value so the filter triggers onChange.
      await user.clear(input);
      await user.type(input, '2024-08-20T10:21');

      expect(mockOnChange).toHaveBeenCalledWith([
        'custom',
        parseDateTimeLocalToUtc('2024-08-20T10:21', DEFAULT_TIMEZONE),
      ]);
    } finally {
      jest.useRealTimers();
    }
  });

  it.each`
    value                                          | expected
    ${new Date(Date.UTC(2024, 8 - 1, 14, 15, 21))} | ${'14 Aug 2024, 15:21:00'}
    ${Date.UTC(2021, 1 - 1, 24, 5, 50, 23)}        | ${'24 Jan 2021, 05:50:23'}
    ${'2021-01-24T05:50:23.000Z'}                  | ${'24 Jan 2021, 05:50:23'}
  `('should render the custom date ($value)', async ({ value, expected }) => {
    const mockOnChange = jest.fn();

    render(
      <DateFilter
        title="by date"
        value={['custom', value]}
        prefilled
        onChange={mockOnChange}
        timezone={DEFAULT_TIMEZONE}
      />
    );

    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
