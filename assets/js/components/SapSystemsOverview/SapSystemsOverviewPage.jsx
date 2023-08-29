/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  getEnrichedApplicationInstances,
  getEnrichedDatabaseInstances,
} from '@state/selectors/sapSystem';
import { addTagToSAPSystem, removeTagFromSAPSystem } from '@state/sapSystems';
import { post, del } from '@lib/network';

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
  const dispatch = useDispatch();

  return (
    <SapSystemsOverview
      sapSystems={sapSystems}
      applicationInstances={enrichedApplicationInstances}
      databaseInstances={enrichedDatabaseInstances}
      loading={loading}
      onTagAdded={(tag, sapSystemID) => {
        addTag(tag, sapSystemID);
        dispatch(
          addTagToSAPSystem({ tags: [{ value: tag }], id: sapSystemID })
        );
      }}
      onTagRemoved={(tag, sapSystemID) => {
        removeTag(tag, sapSystemID);
        dispatch(
          removeTagFromSAPSystem({ tags: [{ value: tag }], id: sapSystemID })
        );
      }}
    />
  );
}

export default SapSystemOverviewPage;
