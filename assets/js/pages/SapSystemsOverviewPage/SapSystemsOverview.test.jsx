import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import userEvent from '@testing-library/user-event';

import {
  clusterFactory,
  clusteredSapInstanceFactory,
  hostFactory,
  sapSystemApplicationInstanceFactory,
  sapSystemFactory,
} from '@lib/test-utils/factories';
import { renderWithRouter } from '@lib/test-utils';
import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';
import { filterTable, clearFilter } from '@common/Table/Table.test';

import SapSystemsOverview from './SapSystemsOverview';

const userAbilities = [{ name: 'all', resource: 'all' }];

describe('SapSystemsOverviews component', () => {
  describe('overview content', () => {
    it('should display the correct number of SAP systems', () => {
      const sapSystemCount = 3;
      const expectedRowCount = sapSystemCount * 2;

      const sapSystems = sapSystemFactory.buildList(sapSystemCount);

      renderWithRouter(
        <SapSystemsOverview
          userAbilities={userAbilities}
          sapSystems={sapSystems}
          applicationInstances={[]}
          databaseInstances={[]}
        />
      );

      expect(
        screen.getByRole('table').querySelectorAll('tbody > tr')
      ).toHaveLength(expectedRowCount);
    });

    it('should display the correct content for a SAP system main row', () => {
      const sapSystemType = 'ABAP';
      const sapSystemID = faker.string.uuid();

      const sapSystem = sapSystemFactory.build({
        id: sapSystemID,
        ensa_version: 'ensa1',
        application_instances: sapSystemApplicationInstanceFactory.buildList(
          2,
          { sap_system_id: sapSystemID, features: sapSystemType }
        ),
      });
      const {
        tenant,
        db_host: dbAddress,
        application_instances: applicationInstances,
        database_instances: databaseInstances,
        database_id: databaseID,
        database_sid: attachedRdbms,
        sid,
      } = sapSystem;

      renderWithRouter(
        <SapSystemsOverview
          sapSystems={[sapSystem]}
          userAbilities={userAbilities}
          applicationInstances={applicationInstances}
          databaseInstances={databaseInstances}
        />
      );
      const rows = screen.getByRole('table').querySelectorAll('tbody > tr');
      const mainRow = rows[0];

      expect(mainRow.querySelector('td:nth-child(3)')).toHaveTextContent(sid);
      expect(mainRow.querySelector('td:nth-child(3) > a')).toHaveAttribute(
        'href',
        `/sap_systems/${sapSystemID}`
      );
      expect(mainRow.querySelector('td:nth-child(4)')).toHaveTextContent(
        attachedRdbms
      );
      expect(mainRow.querySelector('td:nth-child(4) > a')).toHaveAttribute(
        'href',
        `/databases/${databaseID}`
      );
      expect(mainRow.querySelector('td:nth-child(5)')).toHaveTextContent(
        tenant
      );
      expect(mainRow.querySelector('td:nth-child(6)')).toHaveTextContent(
        sapSystemType
      );
      expect(mainRow.querySelector('td:nth-child(7)')).toHaveTextContent(
        dbAddress
      );
      expect(mainRow.querySelector('td:nth-child(8)')).toHaveTextContent(
        'ENSA1'
      );
    });

    it('should display the correct SAP system type JAVA or ABAP', () => {
      const sapSystemTypes = [
        'ABAP',
        'J2EE',
        'SOME_SAP_SYSTEM_FEATURE|NOT_A_REAL_SYSTEM',
      ];

      const expectedSapSystemTypes = ['ABAP', 'JAVA', ''];

      const sapSystems = sapSystemTypes.map((type) => {
        const sapSystemID = faker.string.uuid();
        return sapSystemFactory.build({
          id: sapSystemID,
          application_instances: sapSystemApplicationInstanceFactory.buildList(
            2,
            { sap_system_id: sapSystemID, features: type }
          ),
        });
      });

      const sapSystemApplicationInstances = sapSystems
        .map((sapSystem) => sapSystem.application_instances)
        .flat();

      renderWithRouter(
        <SapSystemsOverview
          sapSystems={sapSystems}
          userAbilities={userAbilities}
          applicationInstances={sapSystemApplicationInstances}
          databaseInstances={[]}
        />
      );
      const rows = screen.getByRole('table').querySelectorAll('tbody > tr');
      expectedSapSystemTypes.forEach((expectedType, index) => {
        const rowIndex = index * 2;
        const sapSystemRow = rows[rowIndex];
        expect(sapSystemRow.querySelector('td:nth-child(6)')).toHaveTextContent(
          expectedType
        );
      });
    });

    it('should display the correct SAP system type JAVA and ABAP', () => {
      const expectedSapSystemTypes = 'ABAP+JAVA';
      const sapSystemID = faker.string.uuid();
      const sapSystem = sapSystemFactory.build({
        id: sapSystemID,
        application_instances: [
          sapSystemApplicationInstanceFactory.build({
            sap_system_id: sapSystemID,
            features: 'ABAP',
          }),
          sapSystemApplicationInstanceFactory.build({
            sap_system_id: sapSystemID,
            features: 'J2EE',
          }),
          sapSystemApplicationInstanceFactory.build({
            sap_system_id: sapSystemID,
            features: 'SOME_SAP_SYSTEM_FEATURE|OTHER_SAP_APP',
          }),
        ],
      });

      const { application_instances: applicationInstances } = sapSystem;

      renderWithRouter(
        <SapSystemsOverview
          sapSystems={[sapSystem]}
          userAbilities={userAbilities}
          applicationInstances={applicationInstances}
          databaseInstances={[]}
        />
      );
      const rows = screen.getByRole('table').querySelectorAll('tbody > tr');
      expect(rows[0].querySelector('td:nth-child(6)')).toHaveTextContent(
        expectedSapSystemTypes
      );
    });

    it('should display the correct content for a SAP system instances', () => {
      const sapSystem = sapSystemFactory.build();
      const {
        application_instances: applicationInstances,
        database_instances: databaseInstances,
      } = sapSystem;

      const enrichedApplicationInstances = applicationInstances.map(
        (instance) => {
          const host = hostFactory.build({ id: instance.host_id });
          const { sid, instance_number } = instance;
          return {
            ...instance,
            host: {
              ...host,
              cluster: clusterFactory.build({
                id: host.cluster_id,
                type: 'hana_scale_up',
                sap_instances: clusteredSapInstanceFactory.buildList(1, {
                  sid,
                  instance_number,
                }),
              }),
            },
          };
        }
      );

      const enrichedDatabaseInstances = databaseInstances.map((instance) => {
        const host = hostFactory.build({ id: instance.host_id });
        const { sid, instance_number } = instance;

        return {
          ...instance,
          host: {
            ...host,
            cluster: clusterFactory.build({
              id: host.cluster_id,
              type: 'hana_scale_up',
              sap_instances: clusteredSapInstanceFactory.buildList(1, {
                sid,
                instance_number,
              }),
            }),
          },
        };
      });
      renderWithRouter(
        <SapSystemsOverview
          userAbilities={userAbilities}
          sapSystems={[sapSystem]}
          applicationInstances={enrichedApplicationInstances}
          databaseInstances={enrichedDatabaseInstances}
        />
      );

      const detailsRow = screen
        .getByRole('table')
        .querySelectorAll('tbody > tr')[1];
      const appTable = detailsRow.querySelectorAll('div.table')[0];
      const dbTable = detailsRow.querySelectorAll('div.table')[1];

      const appInstanceRows = appTable.querySelectorAll(
        '.table-row-group > .table-row'
      );

      const dbInstanceRows = dbTable.querySelectorAll(
        '.table-row-group > .table-row'
      );

      enrichedApplicationInstances.forEach((instance, index) => {
        expect(
          appInstanceRows[index].querySelector('.table-cell:nth-child(2)')
        ).toHaveTextContent(instance.instance_number);
        expect(
          appInstanceRows[index].querySelector('.table-cell:nth-child(4)')
        ).toHaveTextContent(instance.host.cluster.name);
        expect(
          appInstanceRows[index].querySelector('.table-cell:nth-child(4) > a')
        ).toHaveAttribute('href', `/clusters/${instance.host.cluster.id}`);
        expect(
          appInstanceRows[index].querySelector('.table-cell:nth-child(5)')
        ).toHaveTextContent(instance.host.hostname);
        expect(
          appInstanceRows[index].querySelector(
            '.table-cell:nth-child(5) > span > a'
          )
        ).toHaveAttribute('href', `/hosts/${instance.host.id}`);
      });

      enrichedDatabaseInstances.forEach((instance, index) => {
        expect(
          dbInstanceRows[index].querySelector('.table-cell:nth-child(2)')
        ).toHaveTextContent(instance.instance_number);
        expect(
          dbInstanceRows[index].querySelector('.table-cell:nth-child(5)')
        ).toHaveTextContent(instance.host.cluster.name);
        expect(
          dbInstanceRows[index].querySelector('.table-cell:nth-child(5) > a')
        ).toHaveAttribute('href', `/clusters/${instance.host.cluster.id}`);
        expect(
          dbInstanceRows[index].querySelector('.table-cell:nth-child(6)')
        ).toHaveTextContent(instance.host.hostname);
        expect(
          dbInstanceRows[index].querySelector(
            '.table-cell:nth-child(6) > span > a'
          )
        ).toHaveAttribute('href', `/hosts/${instance.host.id}`);
      });
    });
  });

  describe('instance cleanup', () => {
    it.each([
      {
        type: APPLICATION_TYPE,
        text: 'In the case of an ASCS instance',
        field: 'application_instances',
        row: 0,
      },
      {
        type: DATABASE_TYPE,
        text: 'In the case of the last database instance',
        field: 'database_instances',
        row: 1,
      },
    ])(
      'should clean up $type instance on request',
      async ({ type, text, field, row }) => {
        const user = userEvent.setup();
        const mockedCleanUp = jest.fn();

        const sapSystem = sapSystemFactory.build();

        sapSystem.database_instances[0].absent_at = faker.date
          .past()
          .toISOString();

        sapSystem.application_instances[0].absent_at = faker.date
          .past()
          .toISOString();

        renderWithRouter(
          <SapSystemsOverview
            sapSystems={[sapSystem]}
            userAbilities={userAbilities}
            applicationInstances={sapSystem.application_instances}
            databaseInstances={sapSystem.database_instances}
            onInstanceCleanUp={mockedCleanUp}
          />
        );

        const table = screen.getByRole('table');
        await user.click(
          table.querySelector('tbody tr:nth-child(1) td:nth-child(1)')
        );

        const cleanUpButton = screen.queryAllByRole('button', {
          name: 'Clean up',
        })[row];
        await user.click(cleanUpButton);
        expect(
          screen.getByText(text, {
            exact: false,
          })
        ).toBeInTheDocument();

        const cleanUpModalButton = screen.getAllByRole('button', {
          name: 'Clean up',
        })[0];
        await user.click(cleanUpModalButton);
        expect(mockedCleanUp).toHaveBeenCalledWith(sapSystem[field][0], type);
      }
    );

    it('should forbid instance cleanup', async () => {
      const user = userEvent.setup();

      const sapSystem = sapSystemFactory.build();

      sapSystem.database_instances[0].absent_at = faker.date
        .past()
        .toISOString();

      sapSystem.application_instances[0].absent_at = faker.date
        .past()
        .toISOString();

      renderWithRouter(
        <SapSystemsOverview
          sapSystems={[sapSystem]}
          applicationInstances={sapSystem.application_instances}
          databaseInstances={sapSystem.database_instances}
          userAbilities={[]}
        />
      );

      const table = screen.getByRole('table');
      await user.click(
        table.querySelector('tbody tr:nth-child(1) td:nth-child(1)')
      );

      const cleanUpButtons = screen.getAllByRole('button', {
        name: 'Clean up',
      });

      const applicationCleanUpButton = cleanUpButtons[0].closest('button');
      const databaseCleanUpButton = cleanUpButtons[1].closest('button');

      expect(applicationCleanUpButton).toBeDisabled();
      expect(databaseCleanUpButton).toBeDisabled();

      await user.click(applicationCleanUpButton);

      await user.hover(applicationCleanUpButton);

      expect(
        screen.queryByText('You are not authorized for this action')
      ).toBeVisible();
    });
  });

  describe('filtering', () => {
    const scenarios = [
      {
        filter: 'Health',
        options: ['unknown', 'passing', 'warning', 'critical'],
        sapSystems: [].concat(
          sapSystemFactory.buildList(2, { health: 'unknown' }),
          sapSystemFactory.buildList(2, { health: 'passing' }),
          sapSystemFactory.buildList(2, { health: 'warning' }),
          sapSystemFactory.buildList(2, { health: 'critical' })
        ),
        expectedRows: 2,
      },
      {
        filter: 'SID',
        options: ['PRD', 'QAS'],
        sapSystems: [].concat(
          sapSystemFactory.buildList(4),
          sapSystemFactory.buildList(2, { sid: 'PRD' }),
          sapSystemFactory.buildList(2, { sid: 'QAS' })
        ),

        expectedRows: 2,
      },
      {
        filter: 'Tags',
        options: ['Tag1', 'Tag2'],
        sapSystems: [].concat(
          sapSystemFactory.buildList(2),
          sapSystemFactory.buildList(2, { tags: [{ value: 'Tag1' }] }),
          sapSystemFactory.buildList(2, { tags: [{ value: 'Tag2' }] })
        ),
        expectedRows: 2,
      },
    ];

    it.each(scenarios)(
      'should filter the table content by $filter filter',
      ({ filter, options, sapSystems, expectedRows }) => {
        renderWithRouter(
          <SapSystemsOverview
            userAbilities={userAbilities}
            sapSystems={sapSystems}
            applicationInstances={[]}
            databaseInstances={[]}
          />
        );

        options.forEach(async (option) => {
          filterTable(filter, option);
          screen.getByRole('table');
          const table = await waitFor(() =>
            expect(
              table.querySelectorAll('tbody > tr.cursor-pointer')
            ).toHaveLength(expectedRows)
          );

          clearFilter(filter);
        });
      }
    );

    it('should put the filters values in the query string when filters are selected', () => {
      const sapSystems = sapSystemFactory.buildList(1, {
        tags: [{ value: 'Tag1' }],
      });

      const { health, sid, tags } = sapSystems[0];

      renderWithRouter(
        <SapSystemsOverview
          userAbilities={userAbilities}
          sapSystems={sapSystems}
          applicationInstances={[]}
          databaseInstances={[]}
        />
      );

      [
        ['Health', health],
        ['SID', sid],
        ['Tags', tags[0].value],
      ].forEach(([filter, option]) => {
        filterTable(filter, option);
      });

      expect(window.location.search).toEqual(
        `?health=${health}&sid=${sid}&tags=${tags[0].value}`
      );
    });
  });

  describe('tag operations', () => {
    it('should disable tag creation and deletion if the user abilities are not compatible', () => {
      const abilities = [{ name: 'all', resource: 'another_resource' }];

      const sapSystem = sapSystemFactory.build({
        tags: [{ value: 'Tag1' }, { value: 'Tag2' }],
      });

      renderWithRouter(
        <SapSystemsOverview
          userAbilities={abilities}
          sapSystems={[sapSystem]}
          applicationInstances={[]}
          databaseInstances={[]}
        />
      );

      expect(screen.queryByText('Add Tag')).toHaveClass('opacity-50');
      // grab the X
      expect(
        screen.queryByText('Tag1').children.item(0).children.item(0)
      ).toHaveClass('opacity-50');
      expect(
        screen.queryByText('Tag2').children.item(0).children.item(0)
      ).toHaveClass('opacity-50');
    });
  });
});
