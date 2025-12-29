import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';

import useAIContext from '@hooks/useAIContext';

import { getFromConfig } from '@lib/config';
import { APPLICATION_TYPE } from '@lib/model/sapSystems';
import { getEnrichedSapSystemDetails } from '@state/selectors/sapSystem';
import { getRunningOperationsList } from '@state/selectors/runningOperations';
import { getUserProfile } from '@state/selectors/user';
import { deregisterApplicationInstance } from '@state/sapSystems';
import {
  operationRequested,
  updateRunningOperations,
  removeRunningOperation,
} from '@state/runningOperations';

import BackButton from '@common/BackButton';
import { GenericSystemDetails } from '@pages/SapSystemDetails';

import {
  getSapSystemOperations,
  getSapInstanceOperations,
} from './sapOperations';

const operationsEnabled = getFromConfig('operationsEnabled');

function SapSystemDetails() {
  const { id } = useParams();
  const sapSystem = useSelector((state) =>
    getEnrichedSapSystemDetails(state, id)
  );
  const { abilities } = useSelector(getUserProfile);
  const dispatch = useDispatch();

  const runningOperations = useSelector(getRunningOperationsList);

  // Provide context for AI assistant
  const aiContext = useMemo(() => {
    if (!sapSystem) return null;
    return {
      page: 'SAP System Details',
      description: `Details for SAP system ${sapSystem.sid || id}`,
      data: {
        system: {
          id: sapSystem.id,
          sid: sapSystem.sid,
          tenant: sapSystem.tenant,
          health: sapSystem.health,
          applicationInstances: sapSystem.application_instances?.length || 0,
          databaseInstances: sapSystem.database_instances?.length || 0,
        },
        databases:
          sapSystem.databases?.map((db) => ({
            id: db.id,
            sid: db.sid,
            health: db.health,
          })) || [],
        hosts:
          sapSystem.hosts?.map((h) => ({
            hostname: h.hostname,
            health: h.health,
          })) || [],
      },
    };
  }, [sapSystem, id]);
  useAIContext(aiContext);

  useEffect(() => {
    operationsEnabled && dispatch(updateRunningOperations());
  }, [dispatch]);

  if (!sapSystem) {
    return <div>Not Found</div>;
  }

  return (
    <>
      <BackButton url="/sap_systems">Back to SAP Systems</BackButton>
      <GenericSystemDetails
        title="SAP System Details"
        type={APPLICATION_TYPE}
        system={sapSystem}
        userAbilities={abilities}
        cleanUpPermittedFor={['cleanup:application_instance']}
        operationsEnabled={operationsEnabled}
        runningOperations={runningOperations}
        getInstanceOperations={getSapInstanceOperations}
        getSystemOperations={getSapSystemOperations}
        onInstanceCleanUp={(instance) => {
          dispatch(deregisterApplicationInstance(instance));
        }}
        onRequestOperation={(payload) => dispatch(operationRequested(payload))}
        onCleanForbiddenOperation={(groupID) =>
          dispatch(removeRunningOperation({ groupID }))
        }
      />
    </>
  );
}

export default SapSystemDetails;
