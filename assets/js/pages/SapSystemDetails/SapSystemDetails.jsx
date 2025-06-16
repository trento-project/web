import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { getFromConfig } from '@lib/config';
import { APPLICATION_TYPE } from '@lib/model/sapSystems';
import { getEnrichedSapSystemDetails } from '@state/selectors/sapSystem';
import { getUserProfile } from '@state/selectors/user';
import { deregisterApplicationInstance } from '@state/sapSystems';

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
        getInstanceOperations={getSapInstanceOperations}
        onInstanceCleanUp={(instance) => {
          dispatch(deregisterApplicationInstance(instance));
        }}
      />
    </>
  );
}

export default SapSystemDetails;
