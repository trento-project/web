import React from 'react';
import { faker } from '@faker-js/faker';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ActivityLogsSettingsModal from '.';

const positiveInt = () => faker.number.int({ min: 1 });

describe('ActivityLogsSettingsModal component', () => {
  it('renders correctly', async () => {
    const initialRetentionTime = { value: faker.number.int(), unit: 'day' };
    await act(async () => {
      render(
        <ActivityLogsSettingsModal
          open
          onSave={() => {}}
          onChange={() => {}}
          initialRetentionTime={initialRetentionTime}
        />
      );
    });

    expect(screen.getByText('Retention Time')).toBeVisible();

    expect(screen.getByRole('spinbutton')).toHaveValue();
    expect(screen.getByRole('spinbutton')).toBeVisible();
    expect(screen.getByText(initialRetentionTime.unit)).toBeVisible();
  });

  it('should throw when required props are not provided', async () => {
    await expect(
      act(async () => {
        render(
          <ActivityLogsSettingsModal
            open
            onSave={() => {}}
            onChange={() => {}}
          />
        );
      })
    ).rejects.toEqual(expect.any(Error));
  });

  it('should try to save all the changed fields', async () => {
    const user = userEvent.setup();
    const initialRetentionTime = {
      value: positiveInt(),
      unit: 'month',
    };
    const expectedRetentionTime = {
      value: positiveInt(),
      unit: 'day',
    };
    const onSave = jest.fn();

    await act(async () => {
      render(
        <ActivityLogsSettingsModal
          open
          initialRetentionTime={initialRetentionTime}
          onSave={onSave}
          onCancel={() => {}}
        />
      );
    });

    // first clean up the text input then type the new value
    const textInput = screen.getByRole('spinbutton');
    await user.type(
      textInput,
      '{backspace}'.repeat(`${initialRetentionTime.value}`.length)
    );
    await user.type(textInput, `${expectedRetentionTime.value}`);

    // the first click opens the select, the second select the element
    await user.click(screen.getByText(initialRetentionTime.unit));
    await user.click(screen.getByText(expectedRetentionTime.unit));

    await user.click(screen.getByText('Save Settings'));

    expect(onSave).toHaveBeenCalledWith({
      retention_time: expectedRetentionTime,
    });
  });

  it('should try to save all the unchanged fields', async () => {
    const user = userEvent.setup();
    const initialRetentionTime = { value: positiveInt(), unit: 'month' };
    const onSave = jest.fn();

    await act(async () => {
      render(
        <ActivityLogsSettingsModal
          open
          initialRetentionTime={initialRetentionTime}
          onSave={onSave}
          onCancel={() => {}}
        />
      );
    });

    await user.click(screen.getByText('Save Settings'));

    expect(onSave).toHaveBeenCalledWith({
      retention_time: initialRetentionTime,
    });
  });

  const valueError = {
    detail: faker.lorem.words(20),
    source: { pointer: '/retention_time/value' },
    title: faker.lorem.words(10),
  };
  const unitError = {
    detail: faker.lorem.words(20),
    source: { pointer: '/retention_time/unit' },
    title: faker.lorem.words(10),
  };

  it.each`
    scenario                       | errors                     | expectedErrorMessage
    ${'value error'}               | ${[valueError]}            | ${valueError.detail}
    ${'unit error'}                | ${[unitError]}             | ${unitError.detail}
    ${'value and unit errors (1)'} | ${[valueError, unitError]} | ${valueError.detail}
    ${'value and unit errors (2)'} | ${[valueError, unitError]} | ${unitError.detail}
  `(
    'should display errors on $scenario',
    async ({ errors, expectedErrorMessage }) => {
      const initialRetentionTime = { value: positiveInt(), unit: 'month' };

      await act(async () => {
        render(
          <ActivityLogsSettingsModal
            errors={errors}
            initialRetentionTime={initialRetentionTime}
            open
            onSave={() => {}}
            onCancel={() => {}}
          />
        );
      });

      expect(
        screen.getAllByText(expectedErrorMessage, { exact: false })
      ).toHaveLength(1);
    }
  );
});
