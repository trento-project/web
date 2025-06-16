import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { getFromConfig } from '@lib/config';
import { APPLICATION_TYPE } from '@lib/model/sapSystems';
import { getEnrichedSapSystemDetails } from '@state/selectors/sapSystem';
import { getRunningOperationsList } from '@state/selectors/runningOperations';
import { getUserProfile } from '@state/selectors/user';
import { deregisterApplicationInstance } from '@state/sapSystems';
import {
  operationRequested,
  removeRunningOperation,
} from '@state/runningOperations';

import BackButton from '@common/BackButton';
import { GenericSystemDetails } from '@pages/SapSystemDetails';

import { getSapInstanceOperations } from './sapOperations';

const operationsEnabled = getFromConfig('operationsEnabled');

function SapSystemDetails() {
  const { id } = useParams();
  const sapSystem = useSelector((state) =>
    getEnrichedSapSystemDetails(state, id)
  );
  const { abilities } = useSelector(getUserProfile);
  const dispatch = useDispatch();

  const runningOperations = useSelector(getRunningOperationsList());

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
