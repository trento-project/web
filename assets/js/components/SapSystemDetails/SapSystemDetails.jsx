import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getEnrichedSapSystemDetails } from '@state/selectors/sapSystem';

import BackButton from '@components/BackButton';
import { GenericSystemDetails } from '@components/SapSystemDetails';
import { APPLICATION_TYPE } from '@lib/model';

function SapSystemDetails() {
  const { id } = useParams();
  const sapSystem = useSelector((state) =>
    getEnrichedSapSystemDetails(state, id)
  );

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
      />
    </>
  );
}

export default SapSystemDetails;
