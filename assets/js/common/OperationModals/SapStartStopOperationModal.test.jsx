import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { faker } from '@faker-js/faker';

import { sapSystemFactory } from '@lib/test-utils/factories';
import {
  DATABASE_START,
  DATABASE_STOP,
  SAP_SYSTEM_START,
  SAP_SYSTEM_STOP,
} from '@lib/operations';

import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';

import SapStartStopOperationModal from './SapStartStopOperationModal';

const { sid } = sapSystemFactory.build();
const systemReplicationSite = faker.animal.bear();

describe('SapStartStopOperationModal', () => {
  it.each([
    {
      operation: DATABASE_START,
      title: 'Start database',
      expectedDescription: `Start database ${sid}`,
    },
    {
      operation: DATABASE_START,
      title: 'Start database',
      site: systemReplicationSite,
      expectedDescription: `Start database ${sid} on ${systemReplicationSite} site`,
    },
    {
      operation: DATABASE_STOP,
      title: 'Stop database',
      expectedDescription: `Stop database ${sid}`,
    },
    {
      operation: SAP_SYSTEM_START,
      title: 'Start SAP system',
      expectedDescription: `Start SAP system ${sid}`,
    },
    {
      operation: SAP_SYSTEM_STOP,
      title: 'Stop SAP system',
      expectedDescription: `Stop SAP system ${sid}`,
    },
  ])(
    `should show correct title and description for $operation`,
    async ({ operation, title, site, expectedDescription }) => {
      await act(async () => {
        render(
          <SapStartStopOperationModal
            operation={operation}
            sid={sid}
            site={site}
            isOpen
          />
        );
      });

      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(expectedDescription)).toBeInTheDocument();
    }
  );

  it.each([
    {
      option: 'All instances',
      instanceType: 'all',
    },
    {
      option: 'ABAP instances',
      instanceType: 'abap',
    },
    {
      option: 'J2EE instances',
      instanceType: 'j2ee',
    },
    {
      option: 'ASCS/SCS instances',
      instanceType: 'scs',
    },
    {
      option: 'ENQREP instances',
      instanceType: 'enqrep',
    },
  ])(
    'should request a SAP system operation with correct params for $instanceType instance type',
    async ({ option, instanceType }) => {
      const user = userEvent.setup();
      const onRequest = jest.fn();

      await act(async () => {
        render(
          <SapStartStopOperationModal
            operation={SAP_SYSTEM_START}
            sid={sid}
            type={APPLICATION_TYPE}
            isOpen
            onRequest={onRequest}
          />
        );
      });

      expect(screen.getByText('Apply')).toBeDisabled();
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByText('All instances'));
      await user.click(screen.getByRole('option', { name: option }));
      await user.click(screen.getByText('Apply'));

      expect(onRequest).toHaveBeenCalledWith({
        instance_type: instanceType,
        timeout: 300,
      });
    }
  );

  it('should request a database operation with correct params', async () => {
    const user = userEvent.setup();
    const onRequest = jest.fn();

    await act(async () => {
      render(
        <SapStartStopOperationModal
          operation={DATABASE_START}
          sid={sid}
          type={DATABASE_TYPE}
          site={systemReplicationSite}
          isOpen
          onRequest={onRequest}
        />
      );
    });

    expect(screen.getByText('Apply')).toBeDisabled();
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByText('Apply'));

    expect(onRequest).toHaveBeenCalledWith({
      timeout: 300,
      site: systemReplicationSite,
    });
  });

  it('should call onCancel callback', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    await act(async () => {
      render(
        <SapStartStopOperationModal
          operation={SAP_SYSTEM_START}
          sid={sid}
          isOpen
          onCancel={onCancel}
        />
      );
    });

    await user.click(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalled();
  });
});
