/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

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
