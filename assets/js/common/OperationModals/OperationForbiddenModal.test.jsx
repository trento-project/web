// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
import { renderWithRouter } from '@lib/test-utils';
import { hostFactory } from '@lib/test-utils/factories';
import OperationForbiddenModal from './OperationForbiddenModal';

describe('OperationForbiddenModal', () => {
  it('should show forbidden operation modal', async () => {
    await act(() =>
      render(
        <OperationForbiddenModal
          operation="My operation"
          errors={[{ detail: 'error1' }, { detail: 'error2' }]}
          isOpen
        />
      )
    );

    expect(screen.getByText('Operation Forbidden')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Unable to run My operation operation. Some pre-requisites are not met.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Some of the following pre-requisites are not met:')
    ).toBeInTheDocument();

    const list = screen.getByRole('list');
    const { getAllByRole } = within(list);
    const items = getAllByRole('listitem');
    expect(items[0].textContent).toBe('error1');
    expect(items[1].textContent).toBe('error2');
  });

  it('should interpolate multiple placeholders', async () => {
    const { id: hostID1, hostname: hostname1 } = hostFactory.build();
    const { id: hostID2, hostname: hostname2 } = hostFactory.build();
    const { id: hostID3, hostname: hostname3 } = hostFactory.build();

    await act(() =>
      renderWithRouter(
        <OperationForbiddenModal
          operation="My operation"
          errors={[
            {
              detail: 'error message {0}, {1} and {2} links',
              metadata: [
                { id: hostID1, label: hostname1, type: 'host' },
                { id: hostID2, label: hostname2, type: 'host' },
                { id: hostID3, label: hostname3, type: 'host' },
              ],
            },
          ]}
          isOpen
          onCancel={noop}
        />
      )
    );

    const list = screen.getByRole('list');
    const { getAllByRole } = within(list);
    const items = getAllByRole('listitem');
    expect(items[0].textContent).toBe(
      `error message ${hostname1}, ${hostname2} and ${hostname3} links`
    );

    const hostElement1 = screen.getByRole('link', { name: hostname1 });
    const hostElement2 = screen.getByRole('link', { name: hostname2 });
    const hostElement3 = screen.getByRole('link', { name: hostname3 });

    expect(hostElement1).toHaveAttribute('href', `/hosts/${hostID1}`);
    expect(hostElement2).toHaveAttribute('href', `/hosts/${hostID2}`);
    expect(hostElement3).toHaveAttribute('href', `/hosts/${hostID3}`);
  });

  it.each([
    {
      resource: 'host',
      href: '/hosts/',
    },
    {
      resource: 'cluster',
      href: '/clusters/',
    },
    {
      resource: 'database',
      href: '/databases/',
    },
    {
      resource: 'sap_system',
      href: '/sap_systems/',
    },
  ])('should add $resource link to the message', async ({ resource, href }) => {
    const id = 'some-id';
    const label = 'label';

    await act(() =>
      renderWithRouter(
        <OperationForbiddenModal
          operation="My operation"
          errors={[
            {
              detail: 'error message {0}',
              metadata: [{ id, label, type: resource }],
            },
          ]}
          isOpen
        />
      )
    );

    const list = screen.getByRole('list');
    const { getAllByRole } = within(list);
    const items = getAllByRole('listitem');
    expect(items[0].textContent).toBe(`error message ${label}`);
    const hostElement1 = screen.getByRole('link', { name: label });
    expect(hostElement1).toHaveAttribute('href', `${href}${id}`);
  });

  it('should run onCancel when the close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnCancel = jest.fn();
    await act(() =>
      render(
        <OperationForbiddenModal
          operation="My operation"
          errors={[]}
          isOpen
          onCancel={mockOnCancel}
        >
          Some children
        </OperationForbiddenModal>
      )
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  describe('mass operation', () => {
    it('should group the errors by resource', async () => {
      const { id: hostID1, hostname: hostname1 } = hostFactory.build();
      const { id: hostID2, hostname: hostname2 } = hostFactory.build();
      const massMetadata1 = {
        id: hostID1,
        label: hostname1,
        type: 'host',
        mass_operation: true,
      };
      const massMetadata2 = {
        id: hostID2,
        label: hostname2,
        type: 'host',
        mass_operation: true,
      };

      await act(() =>
        renderWithRouter(
          <OperationForbiddenModal
            operation="My operation"
            errors={[
              { detail: 'error1', metadata: [massMetadata1] },
              { detail: 'error2', metadata: [massMetadata1] },
              { detail: 'error3', metadata: [massMetadata2] },
            ]}
            isOpen
          />
        )
      );

      const resourceLink1 = screen.getByRole('link', { name: hostname1 });
      const resourceLink2 = screen.getByRole('link', { name: hostname2 });
      expect(resourceLink1).toHaveAttribute('href', `/hosts/${hostID1}`);
      expect(resourceLink2).toHaveAttribute('href', `/hosts/${hostID2}`);

      const nestedItems1 = within(
        resourceLink1.closest('li').querySelector('ul')
      ).getAllByRole('listitem');
      expect(nestedItems1.map((item) => item.textContent)).toEqual([
        'error1',
        'error2',
      ]);

      const nestedItems2 = within(
        resourceLink2.closest('li').querySelector('ul')
      ).getAllByRole('listitem');
      expect(nestedItems2.map((item) => item.textContent)).toEqual(['error3']);
    });

    it('should keep the message links inside the grouped errors', async () => {
      const { id: hostID, hostname } = hostFactory.build();
      const { id: otherID, hostname: otherHostname } = hostFactory.build();

      await act(() =>
        renderWithRouter(
          <OperationForbiddenModal
            operation="My operation"
            errors={[
              {
                detail: 'error with {0} link',
                metadata: [
                  { id: otherID, label: otherHostname, type: 'host' },
                  {
                    id: hostID,
                    label: hostname,
                    type: 'host',
                    mass_operation: true,
                  },
                ],
              },
            ]}
            isOpen
          />
        )
      );

      const resourceLink = screen.getByRole('link', { name: hostname });
      const nestedItem = within(
        resourceLink.closest('li').querySelector('ul')
      ).getByRole('listitem');

      expect(nestedItem.textContent).toBe(`error with ${otherHostname} link`);
      expect(within(nestedItem).getByRole('link')).toHaveAttribute(
        'href',
        `/hosts/${otherID}`
      );
    });

    it('should run onCancel when a resource link is clicked', async () => {
      const user = userEvent.setup();
      const mockOnCancel = jest.fn();
      const { id, hostname } = hostFactory.build();

      await act(() =>
        renderWithRouter(
          <OperationForbiddenModal
            operation="My operation"
            errors={[
              {
                detail: 'error1',
                metadata: [
                  { id, label: hostname, type: 'host', mass_operation: true },
                ],
              },
            ]}
            isOpen
            onCancel={mockOnCancel}
          />
        )
      );

      await user.click(screen.getByRole('link', { name: hostname }));
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
});
