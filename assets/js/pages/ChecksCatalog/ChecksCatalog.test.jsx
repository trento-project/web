import React from 'react';

import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { faker } from '@faker-js/faker';
import { catalogCheckFactory } from '@lib/test-utils/factories';

import ChecksCatalog from './ChecksCatalog';

describe('ChecksCatalog ChecksCatalog component', () => {
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
        completeCatalog={catalogData}
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
    });
  });

  const scenarios = [
    {
      name: 'catalog without host checks',
      catalogData: catalogCheckFactory.buildList(5, {
        metadata: { target_type: 'cluster' },
      }),
      filter: 'All targets',
      expectDisabled: 'Hosts',
      expectEnabled: 'Clusters',
    },
    {
      name: 'catalog without cluster checks',
      catalogData: catalogCheckFactory.buildList(5, {
        metadata: { target_type: 'host' },
      }),
      filter: 'All targets',
      expectDisabled: 'Clusters',
      expectEnabled: 'Hosts',
    },
    {
      name: 'catalog without hana scale out cluster checks',
      catalogData: [
        catalogCheckFactory.build({
          metadata: {
            target_type: 'cluster',
            cluster_type: 'hana_scale_up',
            hana_scenario: 'performance_optimized',
            architecture_type: 'classic',
          },
        }),
        catalogCheckFactory.build({
          metadata: {
            target_type: 'cluster',
            cluster_type: 'hana_scale_up',
            hana_scenario: 'cost_optimized',
            architecture_type: 'classic',
          },
        }),
        catalogCheckFactory.build({
          metadata: {
            target_type: 'host',
          },
        }),
        catalogCheckFactory.build({
          metadata: {
            target_type: 'cluster',
            cluster_type: 'ascs_ers',
          },
        }),
      ],
      initialTargetType: 'Clusters',
      filter: 'All cluster types',
      expectDisabled: 'HANA Scale Out',
      expectAllEnabled: [
        'HANA Scale Up Perf. Opt.',
        'HANA Scale Up Cost Opt.',
        'ASCS/ERS',
      ],
    },
  ];

  it.each(scenarios)(
    'should rely upon the whole catalog for filters rendering when $name',
    async ({
      catalogData,
      initialTargetType,
      filter,
      expectDisabled,
      expectEnabled,
      expectAllEnabled,
    }) => {
      const user = userEvent.setup();
      const mockUpdateCatalog = jest.fn();

      render(
        <ChecksCatalog
          completeCatalog={catalogData}
          filteredCatalog={catalogCheckFactory.buildList(2)}
          updateCatalog={mockUpdateCatalog}
        />
      );

      if (initialTargetType) {
        await user.click(screen.getByText('All targets'));
        await user.click(screen.getByText(initialTargetType));
      }

      await user.click(screen.getByText(filter));
      expect(
        screen.getByText(expectDisabled, { exact: false }).closest('div')
      ).toHaveAttribute('aria-disabled', 'true');
      const expectItemEnabled = (itemExpectedEnabled) =>
        expect(
          screen.getByText(itemExpectedEnabled).closest('div')
        ).not.toHaveAttribute('aria-disabled');

      if (expectEnabled) {
        expectItemEnabled(expectEnabled);
      }
      if (expectAllEnabled) {
        expectAllEnabled.forEach(expectItemEnabled);
      }
    }
  );

  it('should query the catalog with the correct filters', async () => {
    const user = userEvent.setup();
    const mockUpdateCatalog = jest.fn();

    const catalogData = [
      catalogCheckFactory.build({
        metadata: { target_type: 'host' },
      }),
      catalogCheckFactory.build({
        metadata: {
          target_type: 'cluster',
          cluster_type: 'hana_scale_up',
          hana_scenario: 'performance_optimized',
        },
      }),
      catalogCheckFactory.build({
        metadata: {
          target_type: 'cluster',
          cluster_type: 'hana_scale_up',
          hana_scenario: 'cost_optimized',
        },
      }),
      catalogCheckFactory.build({
        metadata: {
          target_type: 'cluster',
          cluster_type: 'hana_scale_out',
        },
      }),
      catalogCheckFactory.build({
        metadata: {
          target_type: 'cluster',
          cluster_type: 'ascs_ers',
        },
      }),
    ];

    render(
      <ChecksCatalog
        completeCatalog={catalogData}
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
    });
    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(2, {
      selectedClusterType: 'all',
      selectedHanaScenario: 'all',
      selectedProvider: 'aws',
      selectedTargetType: 'all',
    });
    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(3, {
      selectedClusterType: 'all',
      selectedHanaScenario: 'all',
      selectedProvider: 'aws',
      selectedTargetType: 'cluster',
    });
    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(4, {
      selectedClusterType: 'hana_scale_up',
      selectedHanaScenario: 'performance_optimized',
      selectedProvider: 'aws',
      selectedTargetType: 'cluster',
    });
    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(5, {
      selectedClusterType: 'hana_scale_up',
      selectedHanaScenario: 'cost_optimized',
      selectedProvider: 'aws',
      selectedTargetType: 'cluster',
    });
    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(6, {
      selectedClusterType: 'hana_scale_out',
      selectedHanaScenario: null,
      selectedProvider: 'aws',
      selectedTargetType: 'cluster',
    });
    expect(mockUpdateCatalog).toHaveBeenNthCalledWith(7, {
      selectedClusterType: 'ascs_ers',
      selectedHanaScenario: null,
      selectedProvider: 'aws',
      selectedTargetType: 'cluster',
    });
  });
});
