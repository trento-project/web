import { curry, every } from 'lodash';

import { DATABASE_START, DATABASE_STOP } from '@lib/operations';

import { isOperationRunning } from '@state/selectors/runningOperations';

export const getDatabaseOperations = (
  database,
  runningOperations,
  setOperationModelOpen
) => [
  {
    value: 'Start database',
    running: isOperationRunning(runningOperations, database.id, DATABASE_START),
    disabled: database.health === 'passing',
    permitted: ['start:database'],
    onClick: () => {
      setOperationModelOpen({ open: true, operation: DATABASE_START });
    },
  },
  {
    value: 'Stop database',
    running: isOperationRunning(runningOperations, database.id, DATABASE_STOP),
    disabled: every(database.database_instances, { health: 'unknown' }),
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
  ) => [
    {
      value: 'Start database',
      running: isOperationRunning(
        runningOperations,
        database.id,
        DATABASE_START
      ),
      disabled: database.health === 'passing',
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
        DATABASE_STOP
      ),
      disabled: every(database.database_instances, { health: 'unknown' }),
      permitted: ['stop:database'],
      onClick: () => {
        setCurrentOperationSite(site);
        setOperationModelOpen({ open: true, operation: DATABASE_STOP });
      },
    },
  ]
);
