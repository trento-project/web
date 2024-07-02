/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { post, del } from '@lib/network';
import { APPLICATION_TYPE } from '@lib/model/sapSystems';
import {
  getEnrichedApplicationInstances,
  getEnrichedDatabaseInstances,
} from '@state/selectors/sapSystem';
import { getUserProfile } from '@state/selectors/user';
import {
  addTagToSAPSystem,
  removeTagFromSAPSystem,
  deregisterApplicationInstance,
} from '@state/sapSystems';
import { deregisterDatabaseInstance } from '@state/databases';

import SapSystemsOverview from './SapSystemsOverview';

const addTag = (tag, sapSystemID) => {
  post(`/sap_systems/${sapSystemID}/tags`, {
    value: tag,
  });
};

const removeTag = (tag, sapSystemID) => {
  del(`/sap_systems/${sapSystemID}/tags/${tag}`);
};

function SapSystemOverviewPage() {
  const { sapSystems, loading } = useSelector((state) => state.sapSystemsList);
  const enrichedApplicationInstances = useSelector((state) =>
    getEnrichedApplicationInstances(state)
  );
  const enrichedDatabaseInstances = useSelector((state) =>
    getEnrichedDatabaseInstances(state)
  );
  const { abilities } = useSelector(getUserProfile);
  const dispatch = useDispatch();

  return (
    <SapSystemsOverview
      sapSystems={sapSystems}
      applicationInstances={enrichedApplicationInstances}
      databaseInstances={enrichedDatabaseInstances}
      loading={loading}
      userAbilities={abilities}
      onTagAdd={(tag, sapSystemID) => {
        addTag(tag, sapSystemID);
        dispatch(
          addTagToSAPSystem({ tags: [{ value: tag }], id: sapSystemID })
        );
      }}
      onTagRemove={(tag, sapSystemID) => {
        removeTag(tag, sapSystemID);
        dispatch(
          removeTagFromSAPSystem({ tags: [{ value: tag }], id: sapSystemID })
        );
      }}
      onInstanceCleanUp={(instance, instanceType) => {
        instanceType === APPLICATION_TYPE
          ? dispatch(deregisterApplicationInstance(instance))
          : dispatch(deregisterDatabaseInstance(instance));
      }}
    />
  );
}

export default SapSystemOverviewPage;
