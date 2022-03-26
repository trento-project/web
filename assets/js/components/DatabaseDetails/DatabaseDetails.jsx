import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDatabaseDetail } from '@state/selectors';
import GenericSystemDetails from '@components/SapSystemDetails/GenericSystemDetail';
import { DatabaseType } from '@lib/model';

const DatabaseDetails = () => {
  const { id } = useParams();
  const database = useSelector(getDatabaseDetail(id));

  if (!database) {
    return <div>Not Found</div>;
  }

  return (
    <GenericSystemDetails
      title={'HANA Database details'}
      type={DatabaseType}
      system={database}
    />
  );
};

export default DatabaseDetails;
