import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { sapSystemApplicationInstanceFactory } from '@lib/test-utils/factories';
import { SAP_INSTANCE_START, SAP_INSTANCE_STOP } from '@lib/operations';

import SapInstanceStartStopModal from './SapInstanceStartStopModal';

const { instancen_number: instanceNumber, sid } =
  sapSystemApplicationInstanceFactory.build();

describe('SapInstanceStartStopModal', () => {
  it.each([
    {
      operation: SAP_INSTANCE_START,
      title: 'Start SAP instance',
    },
    {
      operation: SAP_INSTANCE_STOP,
      title: 'Stop SAP instance',
    },
  ])(
    `should show correct title and description for $operation`,
    async ({ operation, title }) => {
      await act(async () => {
        render(
          <SapInstanceStartStopModal
            operation={operation}
            isOpen
            instaceNumber={instanceNumber}
            sid={sid}
          />
        );
      });

      expect(screen.getByText(title)).toBeInTheDocument();
      expect(
        screen.getByText(
          `${title} with instance number ${instanceNumber} in ${sid}`
        )
      ).toBeInTheDocument();
    }
  );

  it('should request operation with correct params', async () => {
    const user = userEvent.setup();
    const onRequest = jest.fn();

    await act(async () => {
      render(
        <SapInstanceStartStopModal
          operation={SAP_INSTANCE_START}
          isOpen
          instaceNumber={instanceNumber}
          sid={sid}
          onRequest={onRequest}
        />
      );
    });

    expect(screen.getByText('Apply')).toBeDisabled();
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByText('Apply'));

    expect(onRequest).toBeCalledWith({});
  });

  it('should call onCancel callback', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    await act(async () => {
      render(
        <SapInstanceStartStopModal
          operation={SAP_INSTANCE_START}
          isOpen
          instaceNumber={instanceNumber}
          sid={sid}
          onCancel={onCancel}
        />
      );
    });

    await user.click(screen.getByText('Cancel'));

    expect(onCancel).toBeCalled();
  });
});
