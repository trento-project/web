// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { faker } from '@faker-js/faker';
import { renderWithRouter as render } from '@lib/test-utils';
import { catalogCheckFactory } from '@lib/test-utils/factories';
import { readViewSetting, writeViewSetting } from '@lib/viewSettings';

import ChecksCatalog from './ChecksCatalog';

describe('ChecksCatalog ChecksCatalog component', () => {
  beforeEach(() => {
    // Restore filter settings
    window.sessionStorage.clear();
  });

  it('should render the checks catalog with fetched data', async () => {
    const user = userEvent.setup();

    const groupName1 = faker.string.uuid();
    const groupName2 = faker.string.uuid();
    const group1 = catalogCheckFactory.buildList(5, { group: groupName1 });
    const group2 = catalogCheckFactory.buildList(5, { group: groupName2 });
    const catalogData = group1.concat(group2);

    const mockUpdateCatalog = jest.fn();

    render(
      <ChecksCatalog
        filteredCatalog={catalogData}
        updateCatalog={mockUpdateCatalog}
      />
    );

    const groups = screen.getAllByRole('list');
    expect(groups.length).toBe(2);

    // first group checks are expanded initially
    const checks1 = screen.getAllByRole('listitem');
    expect(checks1.length).toBe(5);

    await user.click(screen.getByText(groupName2));
    const checks2 = screen.getAllByRole('listitem');
    expect(checks2.length).toBe(10);

    expect(mockUpdateCatalog).toHaveBeenCalledWith({
      selectedClusterType: 'all',
      selectedProvider: 'all',
      selectedTargetType: 'all',
      selectedHanaScenario: 'all',
      selectedArchitecture: 'all',
    });
  });

  it('should enable the target type specific filters only for their target type', async () => {
    const user = userEvent.setup();

    render(
      <ChecksCatalog
        filteredCatalog={catalogCheckFactory.buildList(2)}
        updateCatalog={jest.fn()}
      />
    );

    const clusterTypesFilter = () =>
      screen.getByRole('combobox', { name: 'cluster-types' });
    const architecturesFilter = () =>
      screen.getByRole('combobox', { name: 'architectures' });

    // Both target type specific filters are disabled without a selected target
    expect(clusterTypesFilter()).toBeDisabled();
    expect(architecturesFilter()).toBeDisabled();

    await user.click(screen.getByText('All targets'));
    await user.click(screen.getByText('Clusters'));

    expect(clusterTypesFilter()).toBeEnabled();
    expect(architecturesFilter()).toBeDisabled();

    await user.click(screen.getAllByText('Clusters')[0]);
    await user.click(screen.getByText('Hosts'));

    expect(clusterTypesFilter()).toBeDisabled();
    expect(architecturesFilter()).toBeEnabled();
  });

  it('should query the catalog with the correct filters', async () => {
    const user = userEvent.setup();
    const mockUpdateCatalog = jest.fn();

    render(
      <ChecksCatalog
        filteredCatalog={catalogCheckFactory.buildList(2)}
        updateCatalog={mockUpdateCatalog}
      />
    );
    await user.click(screen.getByText('All providers'));
    await user.click(screen.getByText('AWS'));

    await user.click(screen.getByText('All targets'));
    await user.click(screen.getByText('Clusters'));

    await user.click(screen.getByText('All cluster types'));
    await user.click(screen.getByText('HANA Scale Up Perf. Opt.'));

    await user.click(screen.getAllByText('HANA Scale Up Perf. Opt.')[0]);
    await user.click(screen.getByText('HANA Scale Up Cost Opt.'));

    await user.click(screen.getAllByText('HANA Scale Up Cost Opt.')[0]);
    await user.click(screen.getByText('HANA Scale Out'));

    await user.click(screen.getAllByText('HANA Scale Out')[0]);
    await user.click(screen.getByText('ASCS/ERS'));

    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(1, {
      selectedClusterType: 'all',
      selectedHanaScenario: 'all',
      selectedProvider: 'all',
      selectedTargetType: 'all',
      selectedArchitecture: 'all',
    });
    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(2, {
      selectedClusterType: 'all',
      selectedHanaScenario: 'all',
      selectedProvider: 'aws',
      selectedTargetType: 'all',
      selectedArchitecture: 'all',
    });
    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(3, {
      selectedClusterType: 'all',
      selectedHanaScenario: 'all',
      selectedProvider: 'aws',
      selectedTargetType: 'cluster',
      selectedArchitecture: 'all',
    });
    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(4, {
      selectedClusterType: 'hana_scale_up',
      selectedHanaScenario: 'performance_optimized',
      selectedProvider: 'aws',
      selectedTargetType: 'cluster',
      selectedArchitecture: 'all',
    });
    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(5, {
      selectedClusterType: 'hana_scale_up',
      selectedHanaScenario: 'cost_optimized',
      selectedProvider: 'aws',
      selectedTargetType: 'cluster',
      selectedArchitecture: 'all',
    });
    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(6, {
      selectedClusterType: 'hana_scale_out',
      selectedHanaScenario: null,
      selectedProvider: 'aws',
      selectedTargetType: 'cluster',
      selectedArchitecture: 'all',
    });
    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(7, {
      selectedClusterType: 'ascs_ers',
      selectedHanaScenario: null,
      selectedProvider: 'aws',
      selectedTargetType: 'cluster',
      selectedArchitecture: 'all',
    });

    expect(readViewSetting('checksCatalog')).toEqual(
      'provider=aws&targetType=cluster&clusterType=ascs_ers'
    );
  });

  it('should query the catalog with the correct host filters', async () => {
    const user = userEvent.setup();
    const mockUpdateCatalog = jest.fn();

    render(
      <ChecksCatalog
        filteredCatalog={catalogCheckFactory.buildList(2)}
        updateCatalog={mockUpdateCatalog}
      />
    );
    await user.click(screen.getByText('All targets'));
    await user.click(screen.getByText('Hosts'));

    await user.click(screen.getByText('All architectures'));
    await user.click(screen.getByText('x86_64'));

    await user.click(screen.getAllByText('x86_64')[0]);
    await user.click(screen.getByText('ppc64le'));

    await user.click(screen.getAllByText('ppc64le')[0]);
    await user.click(screen.getByText('All architectures'));

    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(1, {
      selectedClusterType: 'all',
      selectedHanaScenario: 'all',
      selectedProvider: 'all',
      selectedTargetType: 'all',
      selectedArchitecture: 'all',
    });

    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(2, {
      selectedClusterType: 'all',
      selectedHanaScenario: 'all',
      selectedProvider: 'all',
      selectedTargetType: 'host',
      selectedArchitecture: 'all',
    });

    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(3, {
      selectedClusterType: 'all',
      selectedHanaScenario: 'all',
      selectedProvider: 'all',
      selectedTargetType: 'host',
      selectedArchitecture: 'x86_64',
    });

    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(4, {
      selectedClusterType: 'all',
      selectedHanaScenario: 'all',
      selectedProvider: 'all',
      selectedTargetType: 'host',
      selectedArchitecture: 'ppc64le',
    });

    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(5, {
      selectedClusterType: 'all',
      selectedHanaScenario: 'all',
      selectedProvider: 'all',
      selectedTargetType: 'host',
      selectedArchitecture: 'all',
    });
  });

  it('should clear the filters of the target type being left behind', async () => {
    const user = userEvent.setup();
    const mockUpdateCatalog = jest.fn();

    render(
      <ChecksCatalog
        filteredCatalog={catalogCheckFactory.buildList(2)}
        updateCatalog={mockUpdateCatalog}
      />,
      { route: '/catalog?targetType=host&architecture=x86_64' }
    );

    await user.click(screen.getByText('Hosts'));
    await user.click(screen.getByText('Clusters'));

    await waitFor(() =>
      expect(mockUpdateCatalog).toHaveBeenLastCalledWith({
        selectedClusterType: 'all',
        selectedHanaScenario: 'all',
        selectedProvider: 'all',
        selectedTargetType: 'cluster',
        selectedArchitecture: 'all',
      })
    );

    expect(window.location.search).toEqual('?targetType=cluster');
  });

  it('should restore the stored filters when landing on a bare url', async () => {
    const mockUpdateCatalog = jest.fn();

    writeViewSetting('checksCatalog', 'targetType=host&provider=aws');

    render(
      <ChecksCatalog
        filteredCatalog={catalogCheckFactory.buildList(2)}
        updateCatalog={mockUpdateCatalog}
      />,
      { route: '/catalog' }
    );

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);

      expect(params.get('targetType')).toEqual('host');
      expect(params.get('provider')).toEqual('aws');
    });

    expect(screen.getByText('Hosts')).toBeVisible();
    expect(screen.getByText('AWS')).toBeVisible();

    // The catalog is queried once, with the restored filters, and not with the
    // empty ones first
    expect(mockUpdateCatalog).toHaveBeenCalledTimes(1);
    expect(mockUpdateCatalog).toHaveBeenLastCalledWith({
      selectedClusterType: 'all',
      selectedHanaScenario: 'all',
      selectedProvider: 'aws',
      selectedTargetType: 'host',
      selectedArchitecture: 'all',
    });
  });

  it('should let the filters in the url win over the stored ones', async () => {
    const mockUpdateCatalog = jest.fn();

    writeViewSetting('checksCatalog', 'provider=aws');

    render(
      <ChecksCatalog
        filteredCatalog={catalogCheckFactory.buildList(2)}
        updateCatalog={mockUpdateCatalog}
      />,
      { route: '/catalog?provider=azure' }
    );

    await waitFor(() =>
      expect(mockUpdateCatalog).toHaveBeenLastCalledWith({
        selectedClusterType: 'all',
        selectedHanaScenario: 'all',
        selectedProvider: 'azure',
        selectedTargetType: 'all',
        selectedArchitecture: 'all',
      })
    );

    await waitFor(() =>
      expect(readViewSetting('checksCatalog')).toEqual('provider=azure')
    );
  });

  it('should store the cleared filters when they are reset with an empty checks catalog', async () => {
    const user = userEvent.setup();
    const mockUpdateCatalog = jest.fn();

    writeViewSetting('checksCatalog', 'provider=aws');

    render(
      <ChecksCatalog filteredCatalog={[]} updateCatalog={mockUpdateCatalog} />,
      { route: '/catalog' }
    );

    await user.click(screen.getByRole('button', { name: 'Reset filters' }));

    await waitFor(() => expect(readViewSetting('checksCatalog')).toEqual(''));
  });

  it('should refresh the catalog with the current filters', async () => {
    const user = userEvent.setup();
    const mockUpdateCatalog = jest.fn();

    render(
      <ChecksCatalog
        filteredCatalog={[]}
        catalogError="Something went wrong"
        updateCatalog={mockUpdateCatalog}
      />,
      { route: '/catalog?provider=aws&targetType=host' }
    );

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(mockUpdateCatalog).toHaveBeenLastCalledWith({
      selectedClusterType: 'all',
      selectedHanaScenario: 'all',
      selectedProvider: 'aws',
      selectedTargetType: 'host',
      selectedArchitecture: 'all',
    });
  });
});
