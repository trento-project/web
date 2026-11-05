// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { bulkOperationResourceFactory } from '@lib/test-utils/factories';
import {
  CLUSTER_MAINTENANCE_CHANGE,
  CLUSTER_RESOURCE_REFRESH,
  waiveOperationDisclaimer,
} from '@lib/operations';

import BulkOperationModal from './BulkOperationModal';

describe('BulkOperationModal', () => {
  beforeAll(() => waiveOperationDisclaimer());

  it.each([
    {
      operation: CLUSTER_MAINTENANCE_CHANGE,
      descriptionResolverArgs: { maintenance: true },
      title: 'Maintenance change',
      expectedDescription: (_content, element) => {
        return (
          element.textContent ===
          'Change maintenance state to True on the following clusters:'
        );
      },
    },
    {
      operation: CLUSTER_MAINTENANCE_CHANGE,
      descriptionResolverArgs: { maintenance: false },
      title: 'Maintenance change',
      expectedDescription: (_content, element) => {
        return (
          element.textContent ===
          'Change maintenance state to False on the following clusters:'
        );
      },
    },
    {
      operation: CLUSTER_RESOURCE_REFRESH,
      descriptionResolverArgs: {},
      title: 'Refresh resources',
      expectedDescription:
        'Refresh all the resources on the following clusters:',
    },
    {
      operation: 'unknown_operation',
      descriptionResolverArgs: {},
      title: 'unknown operation',
      expectedDescription: 'No description available',
    },
  ])(
    'should show correct title and description for $operation',
    async ({
      operation,
      title,
      descriptionResolverArgs,
      expectedDescription,
    }) => {
      await act(() =>
        render(
          <BulkOperationModal
            operation={operation}
            descriptionResolverArgs={descriptionResolverArgs}
            isOpen
          />
        )
      );

      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(expectedDescription)).toBeInTheDocument();
    }
  );

  it('should list the affected resources', async () => {
    const resources = bulkOperationResourceFactory.buildList(3);

    await act(() =>
      render(
        <BulkOperationModal
          operation={CLUSTER_RESOURCE_REFRESH}
          resources={resources}
          isOpen
        />
      )
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(resources.length);
    resources.forEach(({ label }) =>
      expect(screen.getByText(label)).toBeInTheDocument()
    );
  });

  it('should render children', async () => {
    await act(() =>
      render(
        <BulkOperationModal operation={CLUSTER_RESOURCE_REFRESH} isOpen>
          <span>extra input</span>
        </BulkOperationModal>
      )
    );

    expect(screen.getByText('extra input')).toBeInTheDocument();
  });

  it('should call onRequest callback', async () => {
    const user = userEvent.setup();
    const onRequest = jest.fn();

    await act(() =>
      render(
        <BulkOperationModal
          operation={CLUSTER_RESOURCE_REFRESH}
          isOpen
          onRequest={onRequest}
        />
      )
    );

    await user.click(screen.getByText('Request'));

    expect(onRequest).toHaveBeenCalled();
  });

  it('should call onCancel callback', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    await act(() =>
      render(
        <BulkOperationModal
          operation={CLUSTER_RESOURCE_REFRESH}
          isOpen
          onCancel={onCancel}
        />
      )
    );

    await user.click(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalled();
  });
});
