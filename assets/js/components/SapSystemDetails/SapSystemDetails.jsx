import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getSapSystemDetail } from '@state/selectors';
import GenericSystemDetails from './GenericSystemDetail';
import { ApplicationType } from '@lib/model';

const SapSystemDetails = () => {
  const { id } = useParams();
  const sapSystem = useSelector(getSapSystemDetail(id));

  if (!sapSystem) {
    return <div>Not Found</div>;
  }

  return (
    <GenericSystemDetails
      title={'SAP System Details'}
      type={ApplicationType}
      system={sapSystem}
    />
  );
};

export default SapSystemDetails;
