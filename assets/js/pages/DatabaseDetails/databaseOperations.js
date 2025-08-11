import { curry, every, filter, flow, get } from 'lodash';

import { DATABASE_START, DATABASE_STOP } from '@lib/operations';

import { isOperationRunning, getLocalOrTargetParams } from '@state/selectors/runningOperations';

const matchesSite =
  (site) =>
  ({ metadata }) =>
    flow(
      (meta) => getLocalOrTargetParams(meta),
      (params) => get(params, 'site', null) === site
    )(metadata);

export const getDatabaseOperations = (
  database,
  runningOperations,
  setOperationModelOpen
) => [
  {
    value: 'Start database',
    running: isOperationRunning(runningOperations, database.id, DATABASE_START),
    disabled: every(database.instances, { health: 'passing' }),
    permitted: ['start:database'],
    onClick: () => {
      setOperationModelOpen({ open: true, operation: DATABASE_START });
    },
  },
  {
    value: 'Stop database',
    running: isOperationRunning(runningOperations, database.id, DATABASE_STOP),
    disabled: every(database.instances, { health: 'unknown' }),
    permitted: ['stop:database'],
    onClick: () => {
      setOperationModelOpen({ open: true, operation: DATABASE_STOP });
    },
  },
];

export const getDatabaseSiteOperations = curry(
  (
    database,
    runningOperations,
    setOperationModelOpen,
    setCurrentOperationSite,
    site
  ) => {
    const siteInstances = filter(database.instances, {
      system_replication_site: site,
    });

    return [
      {
        value: 'Start database',
        running: isOperationRunning(
          runningOperations,
          database.id,
          DATABASE_START,
          matchesSite(site)
        ),
        disabled: every(siteInstances, { health: 'passing' }),
        permitted: ['start:database'],
        onClick: () => {
          setCurrentOperationSite(site);
          setOperationModelOpen({ open: true, operation: DATABASE_START });
        },
      },
      {
        value: 'Stop database',
        running: isOperationRunning(
          runningOperations,
          database.id,
          DATABASE_STOP,
          matchesSite(site)
        ),
        disabled: every(siteInstances, { health: 'unknown' }),
        permitted: ['stop:database'],
        onClick: () => {
          setCurrentOperationSite(site);
          setOperationModelOpen({ open: true, operation: DATABASE_STOP });
        },
      },
    ];
  }
);
