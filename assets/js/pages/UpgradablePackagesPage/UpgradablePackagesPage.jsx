import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { get } from 'lodash';

import { getHost } from '@state/selectors/host';
import {
  getUpgradablePackages,
  getPatchesLoading,
} from '@state/selectors/softwareUpdates';
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
  }, []);

  const host = useSelector(getHost(hostID));

  const hostname = get(host, 'hostname', '');

  const upgradablePackages = useSelector((state) =>
    getUpgradablePackages(state, hostID)
  );

  const patchesLoading = useSelector((state) =>
    getPatchesLoading(state, hostID)
  );

  useEffect(() => {
    if (upgradablePackages.length > 0) {
      dispatch(fetchUpgradablePackagesPatches({ hostID }));
    }
  }, [upgradablePackages.length]);

  return (
    <>
      <BackButton url={`/hosts/${hostID}`}>Back to Host Details</BackButton>
      <UpgradablePackages
        hostName={hostname}
        upgradablePackages={upgradablePackages}
        patchesLoading={patchesLoading}
        onPatchClick={(advisoryID) =>
          navigate(`/hosts/${hostID}/patches/${advisoryID}`)
        }
      />
    </>
  );
}

export default UpgradablePackagesPage;
