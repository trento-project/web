import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import useAIContext from '@hooks/useAIContext';

import { getEnrichedDatabaseInstances } from '@state/selectors/sapSystem';
import { getUserProfile } from '@state/selectors/user';

import {
  addTagToDatabase,
  removeTagFromDatabase,
  deregisterDatabaseInstance,
} from '@state/databases';
import { post, del } from '@lib/network';

import DatabasesOverview from './DatabasesOverview';

const addTag = (tag, databaseID) => {
  post(`/databases/${databaseID}/tags`, {
    value: tag,
  });
};

const removeTag = (tag, databaseID) => {
  del(`/databases/${databaseID}/tags/${tag}`);
};

function DatabasesOverviewPage() {
  const { databases, loading } = useSelector((state) => state.databasesList);
  const enrichedDatabaseInstances = useSelector((state) =>
    getEnrichedDatabaseInstances(state)
  );
  const dispatch = useDispatch();
  const { abilities } = useSelector(getUserProfile);

  // Provide context for AI assistant
  const aiContext = useMemo(
    () => ({
      page: 'HANA Databases',
      description: 'Overview of SAP HANA database instances',
      data: {
        totalDatabases: databases?.length || 0,
        totalInstances: enrichedDatabaseInstances?.length || 0,
        healthSummary: databases.reduce((acc, db) => {
          acc[db.health] = (acc[db.health] || 0) + 1;
          return acc;
        }, {}),
      },
    }),
    [databases, enrichedDatabaseInstances]
  );
  useAIContext(aiContext);

  return (
    <DatabasesOverview
      userAbilities={abilities}
      databases={databases}
      databaseInstances={enrichedDatabaseInstances}
      loading={loading}
      onTagAdd={(tag, databaseID) => {
        addTag(tag, databaseID);
        dispatch(addTagToDatabase({ tags: [{ value: tag }], id: databaseID }));
      }}
      onTagRemove={(tag, databaseID) => {
        removeTag(tag, databaseID);
        dispatch(
          removeTagFromDatabase({ tags: [{ value: tag }], id: databaseID })
        );
      }}
      onInstanceCleanUp={(instance) => {
        dispatch(deregisterDatabaseInstance(instance));
      }}
    />
  );
}

export default DatabasesOverviewPage;
