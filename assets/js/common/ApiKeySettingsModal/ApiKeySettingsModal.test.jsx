import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { faker } from '@faker-js/faker';
import {
  addMonths,
  getMonth,
  getYear,
  getDay,
  addYears,
  addDays,
} from 'date-fns';
import ApiKeySettingsModal from './ApiKeySettingsModal';
import '@testing-library/jest-dom';

describe('ApiKeySettingsModal', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Generation form', () => {
    it('render the generation form', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<ApiKeySettingsModal open />);
      });

      expect(screen.getByText('Never Expires')).toBeVisible();
      expect(screen.getByText('Key Expiration')).toBeVisible();
      expect(screen.getByText('Key Expiration')).toBeVisible();
      expect(
        screen.getByText(
          'By generating a new key, you will need to replace the API key on all hosts.'
        )
      ).toBeVisible();
      expect(screen.getByRole('spinbutton')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Generate' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'months' })).toBeVisible();

      await user.click(screen.getByRole('button', { name: 'months' }));

      expect(screen.getByRole('listbox')).toBeVisible();
      expect(screen.getAllByRole('option')).toHaveLength(3);
      expect(screen.getByRole('option', { name: 'years' })).toBeVisible();

      expect(screen.getByRole('option', { name: 'months' })).toBeVisible();

      expect(screen.getByRole('option', { name: 'days' })).toBeVisible();
    });

    it('should show a validation error when quantity is 0 and the form is enabled', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<ApiKeySettingsModal open />);
      });

      await user.type(screen.getByRole('spinbutton'), '0');

      await user.click(screen.getByRole('button', { name: 'Generate' }));

      expect(
        screen.getByText('Key expiration value needs to be greater than 0')
      ).toBeVisible();
    });

    it('should not show a validation error when quantity is > 0 and the form is enabled', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<ApiKeySettingsModal open />);
      });

      await user.type(screen.getByRole('spinbutton'), '20');

      await user.click(screen.getByRole('button', { name: 'Generate' }));

      expect(
        screen.queryByText('Key expiration value needs to be greater than 0')
      ).not.toBeInTheDocument();
    });

    it('should return on onGenerate the correct expiration date when months are selected with a valid quantity', async () => {
      const user = userEvent.setup();
      const onGenerate = jest.fn();

      await act(async () => {
        render(<ApiKeySettingsModal open onGenerate={onGenerate} />);
      });

      await user.type(screen.getByRole('spinbutton'), '20');

      await user.click(screen.getByRole('button', { name: 'months' }));

      await user.click(screen.getByRole('button', { name: 'Generate' }));

      const [{ apiKeyExpiration: generatedApiKeyExpiration }] =
        onGenerate.mock.lastCall;

      const expectedExpirationDate = addMonths(new Date(), 20);
      expect(getMonth(generatedApiKeyExpiration)).toEqual(
        getMonth(expectedExpirationDate)
      );

      expect(getYear(generatedApiKeyExpiration)).toEqual(
        getYear(expectedExpirationDate)
      );

      expect(getDay(generatedApiKeyExpiration)).toEqual(
        getDay(expectedExpirationDate)
      );
    });

    it('should return on onGenerate the correct expiration date when years are selected with a valid quantity', async () => {
      const user = userEvent.setup();
      const onGenerate = jest.fn();

      await act(async () => {
        render(<ApiKeySettingsModal open onGenerate={onGenerate} />);
      });

      await user.type(screen.getByRole('spinbutton'), '2');

      // months are default click on the select to show all the details
      await user.click(screen.getByRole('button', { name: 'months' }));

      await user.click(screen.getByRole('option', { name: 'years' }));

      await user.click(screen.getByRole('button', { name: 'Generate' }));

      const [{ apiKeyExpiration: generatedApiKeyExpiration }] =
        onGenerate.mock.lastCall;

      const expectedExpirationDate = addYears(new Date(), 2);
      expect(getMonth(generatedApiKeyExpiration)).toEqual(
        getMonth(expectedExpirationDate)
      );

      expect(getYear(generatedApiKeyExpiration)).toEqual(
        getYear(expectedExpirationDate)
      );

      expect(getDay(generatedApiKeyExpiration)).toEqual(
        getDay(expectedExpirationDate)
      );
    });

    it('should return on onGenerate the correct expiration date when days are selected with a valid quantity', async () => {
      const user = userEvent.setup();
      const onGenerate = jest.fn();

      await act(async () => {
        render(<ApiKeySettingsModal open onGenerate={onGenerate} />);
      });

      await user.type(screen.getByRole('spinbutton'), '20');

      // months are default click on the select to show all the details
      await user.click(screen.getByRole('button', { name: 'months' }));

      await user.click(screen.getByRole('option', { name: 'days' }));

      await user.click(screen.getByRole('button', { name: 'Generate' }));

      const [{ apiKeyExpiration: generatedApiKeyExpiration }] =
        onGenerate.mock.lastCall;

      const expectedExpirationDate = addDays(new Date(), 20);
      expect(getMonth(generatedApiKeyExpiration)).toEqual(
        getMonth(expectedExpirationDate)
      );

      expect(getYear(generatedApiKeyExpiration)).toEqual(
        getYear(expectedExpirationDate)
      );

      expect(getDay(generatedApiKeyExpiration)).toEqual(
        getDay(expectedExpirationDate)
      );
    });

    it('should have generate button disabled when the modal has loading prop set to true', async () => {
      await act(async () => {
        render(<ApiKeySettingsModal open loading />);
      });
      expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled();
    });

    it('should have the form inputs disabled when the generation if form is disabled by the user', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<ApiKeySettingsModal open />);
      });

      await user.click(screen.getByRole('switch'));

      expect(screen.getByRole('spinbutton')).toBeDisabled();

      expect(screen.getByRole('button', { name: 'months' })).toBeDisabled();
    });

    it('should return on onGenerate null expiration date when the generation form is disabled by the user', async () => {
      const user = userEvent.setup();
      const onGenerate = jest.fn();

      await act(async () => {
        render(<ApiKeySettingsModal open onGenerate={onGenerate} />);
      });

      await user.click(screen.getByRole('switch'));

      await user.click(screen.getByRole('button', { name: 'Generate' }));

      expect(onGenerate).toBeCalledWith({ apiKeyExpiration: null });
    });
  });
  describe('Generated api key display', () => {
    it('should display the generated api key with expiration, when provided as props', async () => {
      const user = userEvent.setup();
      const apiKey = faker.string.alpha({ length: { min: 100, max: 100 } });
      const nowISO = new Date().toISOString();

      await act(async () => {
        render(
          <ApiKeySettingsModal
            open
            generatedApiKey={apiKey}
            generatedApiKeyExpiration={nowISO}
          />
        );
      });

      await user.click(screen.getByRole('switch'));
      await user.click(screen.getByRole('button', { name: 'Generate' }));

      await user.click(
        screen.getByRole('button', { name: 'copy to clipboard' })
      );

      expect(screen.getByText(apiKey)).toBeVisible();
    });
  });
});
