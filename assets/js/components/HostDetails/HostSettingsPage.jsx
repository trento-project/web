import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import LoadingBox from '@components/LoadingBox';

import { updateCatalog } from '@state/actions/catalog';
import { getCatalog } from '@state/selectors/catalog';
import { getHost } from '@state/selectors';
import HostChecksSelection from './HostChecksSelection';

function HostSettingsPage() {
  const dispatch = useDispatch();

  const { hostID } = useParams();
  const host = useSelector(getHost(hostID));

  const {
    data: catalog,
    error: catalogError,
    loading: catalogLoading,
  } = useSelector(getCatalog());

  if (!host) {
    return <LoadingBox text="Loading..." />;
  }

  return (
    <HostChecksSelection
      host={host}
      catalog={catalog}
      catalogError={catalogError}
      catalogLoading={catalogLoading}
      onUpdateCatalog={() =>
        dispatch(
          updateCatalog({
            provider: host.provider,
            target_type: 'host',
          })
        )
      }
    />
  );
}

export default HostSettingsPage;
