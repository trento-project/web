import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { waiveOperationDisclaimer } from '@lib/operations';

import {
  sapSystemApplicationInstanceFactory,
  hostFactory,
} from '@lib/test-utils/factories';
import {
  SAP_INSTANCE_START,
  SAP_INSTANCE_STOP,
  PACEMAKER_ENABLE,
  PACEMAKER_DISABLE,
  CLUSTER_HOST_START,
  CLUSTER_HOST_STOP,
  CLUSTER_MAINTENANCE_CHANGE,
  CLUSTER_RESOURCE_REFRESH,
  HOST_REBOOT,
} from '@lib/operations';

import SimpleAcceptanceOperationModal from './SimpleAcceptanceOperationModal';

const { instance_number: instanceNumber, sid } =
  sapSystemApplicationInstanceFactory.build();

const { hostname: hostName } = hostFactory.build();

const resourceID = 'rsc_ip_PRD_HDB00';

describe('SimpleAcceptanceOperationModal', () => {
  beforeAll(() => waiveOperationDisclaimer());

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
      expectedDescription: `Enable Pacemaker systemd unit at boot on host ${hostName}`,
    },
    {
      operation: PACEMAKER_DISABLE,
      descriptionResolverArgs: { hostName },
      title: 'Disable Pacemaker',
      expectedDescription: `Disable Pacemaker systemd unit at boot on host ${hostName}`,
    },
    {
      operation: CLUSTER_MAINTENANCE_CHANGE,
      descriptionResolverArgs: { maintenance: true },
      title: 'Maintenance change',
      expectedDescription: /Change maintenance state to.*on cluster/,
    },
    {
      operation: CLUSTER_MAINTENANCE_CHANGE,
      descriptionResolverArgs: { maintenance: false, node_id: hostName },
      title: 'Maintenance change',
      expectedDescription: new RegExp(
        `Change maintenance state to.*on node ${hostName}`
      ),
    },
    {
      operation: CLUSTER_MAINTENANCE_CHANGE,
      descriptionResolverArgs: { maintenance: true, resource_id: resourceID },
      title: 'Maintenance change',
      expectedDescription: new RegExp(
        `Change maintenance state to.*on resource ${resourceID}`
      ),
    },
    {
      operation: CLUSTER_RESOURCE_REFRESH,
      descriptionResolverArgs: {},
      title: 'Refresh resources',
      expectedDescription: 'Refresh all cluster resources',
    },
    {
      operation: CLUSTER_RESOURCE_REFRESH,
      descriptionResolverArgs: { resource_id: resourceID },
      title: 'Refresh resources',
      expectedDescription: (_content, element) => {
        return element.textContent === `Refresh cluster resource ${resourceID}`;
      },
    },
    {
      operation: CLUSTER_HOST_START,
      descriptionResolverArgs: { hostName },
      title: 'Start cluster host',
      expectedDescription: `Start cluster host ${hostName}`,
    },
    {
      operation: CLUSTER_HOST_STOP,
      descriptionResolverArgs: { hostName },
      title: 'Stop cluster host',
      expectedDescription: `Stop cluster host ${hostName}`,
    },
    {
      operation: HOST_REBOOT,
      descriptionResolverArgs: { hostName },
      title: 'Reboot host',
      expectedDescription: `Reboot host ${hostName}`,
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
      render(
        <SimpleAcceptanceOperationModal
          operation={operation}
          descriptionResolverArgs={descriptionResolverArgs}
          isOpen
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(expectedDescription)).toBeInTheDocument();
    }
  );

  it('should request operation with correct params', async () => {
    const user = userEvent.setup();
    const onRequest = jest.fn();

    render(
      <SimpleAcceptanceOperationModal
        operation={SAP_INSTANCE_START}
        isOpen
        onRequest={onRequest}
      />
    );

    expect(screen.getByText('Request')).toBeEnabled();
    await user.click(screen.getByText('Request'));

    expect(onRequest).toHaveBeenCalledWith({});
  });

  it('should call onCancel callback', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(
      <SimpleAcceptanceOperationModal
        operation={SAP_INSTANCE_START}
        isOpen
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalled();
  });
});
