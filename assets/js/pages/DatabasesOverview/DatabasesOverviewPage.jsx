// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getEnrichedDatabaseInstances } from '@state/selectors/sapSystem';
import { getUserProfile } from '@state/selectors/user';
import { getRunningOperation } from '@state/selectors/runningOperations';
import {
  DATABASE_BULK_OPERATION_ID,
  bulkOperationRequested,
  removeRunningOperation,
} from '@state/runningOperations';

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
  const { abilities, timezone } = useSelector(getUserProfile);
  const bulkOperation = useSelector(
    getRunningOperation(DATABASE_BULK_OPERATION_ID)
  );

  return (
    <DatabasesOverview
      userAbilities={abilities}
      userTimezone={timezone}
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
      bulkOperation={bulkOperation}
      onBulkOperationRequest={({ operation, databases: targets, params }) => {
        dispatch(
          bulkOperationRequested({
            bulkOperationID: DATABASE_BULK_OPERATION_ID,
            targetGroupIDs: targets.map(({ id }) => id),
            operation,
            params,
          })
        );
      }}
      onBulkOperationForbiddenDismiss={() => {
        dispatch(
          removeRunningOperation({ groupID: DATABASE_BULK_OPERATION_ID })
        );
      }}
    />
  );
}

export default DatabasesOverviewPage;
