import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { APPLICATION_TYPE } from '@lib/model/sapSystems';
import { getEnrichedSapSystemDetails } from '@state/selectors/sapSystem';
import { deregisterApplicationInstance } from '@state/sapSystems';

import BackButton from '@components/BackButton';
import { GenericSystemDetails } from '@components/SapSystemDetails';

function SapSystemDetails() {
  const { id } = useParams();
  const sapSystem = useSelector((state) =>
    getEnrichedSapSystemDetails(state, id)
  );
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
        onInstanceCleanUp={(instance) => {
          dispatch(deregisterApplicationInstance(instance));
        }}
      />
    </>
  );
}

export default SapSystemDetails;
