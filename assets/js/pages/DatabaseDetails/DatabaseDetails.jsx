import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';

import { getFromConfig } from '@lib/config';
import { DATABASE_TYPE } from '@lib/model/sapSystems';

import BackButton from '@common/BackButton';

import { GenericSystemDetails } from '@pages/SapSystemDetails';

import { getEnrichedDatabaseDetails } from '@state/selectors/sapSystem';
import { getRunningOperationsList } from '@state/selectors/runningOperations';
import { getUserProfile } from '@state/selectors/user';
import { deregisterDatabaseInstance } from '@state/databases';
import {
  operationRequested,
  updateRunningOperations,
  removeRunningOperation,
} from '@state/runningOperations';

import {
  getDatabaseOperations,
  getDatabaseSiteOperations,
} from './databaseOperations';

const operationsEnabled = getFromConfig('operationsEnabled');

function DatabaseDetails() {
  const { id } = useParams();
  const database = useSelector((state) =>
    getEnrichedDatabaseDetails(state, id)
  );
  const { abilities } = useSelector(getUserProfile);
  const dispatch = useDispatch();

  const runningOperations = useSelector(getRunningOperationsList);

  useEffect(() => {
    operationsEnabled && dispatch(updateRunningOperations());
  }, [dispatch]);

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
        operationsEnabled={operationsEnabled}
        runningOperations={runningOperations}
        getSystemOperations={getDatabaseOperations}
        getSiteOperations={getDatabaseSiteOperations}
        onInstanceCleanUp={(instance) => {
          dispatch(deregisterDatabaseInstance(instance));
        }}
        onRequestOperation={(payload) => dispatch(operationRequested(payload))}
        onCleanForbiddenOperation={(groupID) =>
          dispatch(removeRunningOperation({ groupID }))
        }
      />
    </>
  );
}

export default DatabaseDetails;
