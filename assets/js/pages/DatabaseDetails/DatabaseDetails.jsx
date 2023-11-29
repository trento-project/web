import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { DATABASE_TYPE } from '@lib/model/sapSystems';
import { getEnrichedDatabaseDetails } from '@state/selectors/sapSystem';
import { deregisterDatabaseInstance } from '@state/databases';

import BackButton from '@common/BackButton';
import { GenericSystemDetails } from '@pages/SapSystemDetails';

function DatabaseDetails() {
  const { id } = useParams();
  const database = useSelector((state) =>
    getEnrichedDatabaseDetails(state, id)
  );
  const dispatch = useDispatch();

  if (!database) {
    return <div>Not Found</div>;
  }

  return (
    <>
      <BackButton url="/databases">Back to HANA Databases</BackButton>
      <GenericSystemDetails
        title="HANA Database Details"
        type={DATABASE_TYPE}
        system={database}
        onInstanceCleanUp={(instance) => {
          dispatch(deregisterDatabaseInstance(instance));
        }}
      />
    </>
  );
}

export default DatabaseDetails;
