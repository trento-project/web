import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDatabaseDetail } from '@state/selectors';

import BackButton from '@components/BackButton';
import { GenericSystemDetails } from '@components/SapSystemDetails';
import { DATABASE_TYPE } from '@lib/model';

function DatabaseDetails() {
  const { id } = useParams();
  const database = useSelector(getDatabaseDetail(id));

  if (!database) {
    return <div>Not Found</div>;
  }

  return (
    <>
      <BackButton url={`/databases`}>Back to HANA Databases</BackButton>
      <GenericSystemDetails
        title="HANA Database Details"
        type={DATABASE_TYPE}
        system={database}
      />
    </>
  );
}

export default DatabaseDetails;
