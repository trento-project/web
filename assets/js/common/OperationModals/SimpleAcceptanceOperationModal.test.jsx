import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import {
  sapSystemApplicationInstanceFactory,
  hostFactory,
} from '@lib/test-utils/factories';
import {
  SAP_INSTANCE_START,
  SAP_INSTANCE_STOP,
  PACEMAKER_ENABLE,
  PACEMAKER_DISABLE,
} from '@lib/operations';

import SimpleAcceptanceOperationModal from './SimpleAcceptanceOperationModal';

const { instance_number: instanceNumber, sid } =
  sapSystemApplicationInstanceFactory.build();

const { hostname: hostName } = hostFactory.build();

describe('SimpleAcceptanceOperationModal', () => {
  it.each([
    {
      operation: SAP_INSTANCE_START,
      descriptionResolverArgs: { instanceNumber, sid },
      title: 'Start SAP instance',
      expectedDescription: `Start SAP instance with instance number ${instanceNumber} in ${sid}`,
    },
    {
      operation: SAP_INSTANCE_STOP,
      descriptionResolverArgs: { instanceNumber, sid },
      title: 'Stop SAP instance',
      expectedDescription: `Stop SAP instance with instance number ${instanceNumber} in ${sid}`,
    },
    {
      operation: PACEMAKER_ENABLE,
      descriptionResolverArgs: { hostName },
      title: 'Enable Pacemaker',
      expectedDescription: `Enable Pacemaker systemd unit on host ${hostName}`,
    },
    {
      operation: PACEMAKER_DISABLE,
      descriptionResolverArgs: { hostName },
      title: 'Disable Pacemaker',
      expectedDescription: `Disable Pacemaker systemd unit on host ${hostName}`,
    },
    {
      operation: 'unknown_operation',
      descriptionResolverArgs: {},
      title: 'unknown operation',
      expectedDescription: 'No description available',
    },
  ])(
    `should show correct title and description for $operation`,
    async ({
      operation,
      title,
      descriptionResolverArgs,
      expectedDescription,
    }) => {
      await act(async () => {
        render(
          <SimpleAcceptanceOperationModal
            operation={operation}
            descriptionResolverArgs={descriptionResolverArgs}
            isOpen
          />
        );
      });

      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(expectedDescription)).toBeInTheDocument();
    }
  );

  it('should request operation with correct params', async () => {
    const user = userEvent.setup();
    const onRequest = jest.fn();

    await act(async () => {
      render(
        <SimpleAcceptanceOperationModal
          operation={SAP_INSTANCE_START}
          isOpen
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
        <SimpleAcceptanceOperationModal
          operation={SAP_INSTANCE_START}
          isOpen
          onCancel={onCancel}
        />
      );
    });

    await user.click(screen.getByText('Cancel'));

    expect(onCancel).toBeCalled();
  });
});
