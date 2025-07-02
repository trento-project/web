import React from 'react';
import { useParams } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';

import { DATABASE_TYPE } from '@lib/model/sapSystems';

import BackButton from '@common/BackButton';

import { GenericSystemDetails } from '@pages/SapSystemDetails';

import { getEnrichedDatabaseDetails } from '@state/selectors/sapSystem';
import { getUserProfile } from '@state/selectors/user';
import { deregisterDatabaseInstance } from '@state/databases';

function DatabaseDetails() {
  const { id } = useParams();
  const database = useSelector((state) =>
    getEnrichedDatabaseDetails(state, id)
  );
  const { abilities } = useSelector(getUserProfile);
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
        userAbilities={abilities}
        cleanUpPermittedFor={['cleanup:database_instance']}
        onInstanceCleanUp={(instance) => {
          dispatch(deregisterDatabaseInstance(instance));
        }}
      />
    </>
  );
}

export default DatabaseDetails;
