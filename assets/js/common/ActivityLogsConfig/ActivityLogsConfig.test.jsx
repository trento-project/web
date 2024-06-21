import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ActivityLogsConfig from '.';

describe('ActivityLogsConfig', () => {
  it.each`
    time                           | expected
    ${'1 day'}                     | ${'1 day'}
    ${{ value: 1, unit: 'month' }} | ${'1 month'}
    ${{ value: 2, unit: 'month' }} | ${'2 months'}
    ${/* invalid */ 12345}         | ${'invalid value'}
    ${/* invalid */ { foo: true }} | ${'invalid value'}
    ${undefined}                   | ${'invalid value'}
    ${null}                        | ${'invalid value'}
  `(
    'should render `$expected` with retention time `$time`',
    ({ time, expected }) => {
      render(<ActivityLogsConfig retentionTime={time} />);

      expect(screen.getByText(expected)).toBeInTheDocument();
    }
  );

  it('should fire onEditClick when clicking on the edit button', async () => {
    const spy = jest.fn();
    const user = userEvent.setup();

    render(<ActivityLogsConfig onEditClick={spy} />);

    await user.click(screen.getByRole('button', { name: 'Edit Settings' }));

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
