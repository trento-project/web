import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { get } from 'lodash';

import { getHost } from '@state/selectors/host';
import { getUpgradablePackages } from '@state/selectors/softwareUpdates';
import { fetchSoftwareUpdatesSettings } from '@state/softwareUpdatesSettings';
import {
  fetchSoftwareUpdates,
  fetchUpgradablePackagesPatches,
} from '@state/softwareUpdates';

import BackButton from '@common/BackButton';
import UpgradablePackages from './UpgradablePackages';

function UpgradablePackagesPage() {
  const { hostID } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSoftwareUpdates(hostID));
    dispatch(fetchSoftwareUpdatesSettings());
  }, []);

  const host = useSelector(getHost(hostID));

  const hostname = get(host, 'hostname', '');

  const upgradablePackages = useSelector((state) =>
    getUpgradablePackages(state, hostID)
  );

  useEffect(() => {
    const packageIDs = upgradablePackages.map(
      ({ to_package_id: packageID }) => packageID
    );

    dispatch(fetchUpgradablePackagesPatches({ hostID, packageIDs }));
  }, [upgradablePackages.length, hostID]);

  return (
    <>
      <BackButton url={`/hosts/${hostID}`}>Back to Host Details</BackButton>
      <UpgradablePackages
        hostName={hostname}
        upgradablePackages={upgradablePackages}
        onPatchClick={(advisoryID) => navigate()}
      />
    </>
  );
}

export default UpgradablePackagesPage;
