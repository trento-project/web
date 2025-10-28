import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import {
  addMonths,
  getMonth,
  getYear,
  getDay,
  addYears,
  addDays,
} from 'date-fns';

import GenerateTokenModal from './GenerateTokenModal';

describe('GenerateTokenModal', () => {
  it('should generate personal access token without expiration date', async () => {
    const user = userEvent.setup();
    const mockOnGenerate = jest.fn();
    const tokenName = 'My token';
    render(<GenerateTokenModal isOpen onGenerate={mockOnGenerate} />);

    expect(
      screen.getByRole('button', { name: 'Generate Token' })
    ).toBeDisabled();

    await user.type(screen.getByRole('textbox'), tokenName);
    await user.click(screen.getByRole('switch'));
    expect(screen.getByText('Key will never expire')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Generate Token' }));
    expect(mockOnGenerate).toHaveBeenCalledWith(tokenName, null);
  });

  it.each([
    { dateType: 'months', addTime: addMonths },
    { dateType: 'days', addTime: addDays },
    { dateType: 'years', addTime: addYears },
  ])(
    'should generate personal access token with expiration date using $dateType',
    async ({ dateType, addTime }) => {
      const user = userEvent.setup();
      const mockOnGenerate = jest.fn();
      const tokenName = 'My token';
      render(<GenerateTokenModal isOpen onGenerate={mockOnGenerate} />);

      expect(
        screen.getByRole('button', { name: 'Generate Token' })
      ).toBeDisabled();

      await user.type(screen.getByRole('textbox'), tokenName);
      await user.type(screen.getByRole('spinbutton'), '{backspace}3');
      await user.click(screen.getByRole('button', { name: 'months' }));
      await user.click(screen.getByRole('option', { name: dateType }));
      await user.click(screen.getByRole('button', { name: 'Generate Token' }));

      const [token, tokenExpirationData] = mockOnGenerate.mock.lastCall;

      expect(token).toBe(tokenName);
      const expectedExpirationDate = addTime(new Date(), 3);
      expect(getMonth(tokenExpirationData)).toEqual(
        getMonth(expectedExpirationDate)
      );

      expect(getYear(tokenExpirationData)).toEqual(
        getYear(expectedExpirationDate)
      );

      expect(getDay(tokenExpirationData)).toEqual(
        getDay(expectedExpirationDate)
      );
    }
  );

  it('should run onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = jest.fn();
    render(<GenerateTokenModal isOpen onClose={mockOnClose} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
