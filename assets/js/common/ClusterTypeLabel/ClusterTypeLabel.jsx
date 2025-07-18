import React from 'react';

import { Link } from 'react-router';
import { EOS_INFO_OUTLINED, EOS_STAR } from 'eos-icons-react';

import Tooltip from '@common/Tooltip';
import {
  ANGI_ARCHITECTURE,
  CLASSIC_ARCHITECTURE,
  getClusterTypeLabel,
  getClusterScenarioLabel,
} from '@lib/model/clusters';

const MIGRATION_URL =
  'https://www.suse.com/c/how-to-upgrade-to-saphanasr-angi/';
const ANGI_TOOLTIP_MESSAGE = 'Angi architecture';
const CLASSIC_TOOLTIP_MESSAGE = (
  <span>
    Classic architecture. Recommended{' '}
    <Link
      to={MIGRATION_URL}
      className="text-jungle-green-500 hover:opacity-75"
      target="_blank"
    >
      migration
    </Link>{' '}
    to Angi architecture
  </span>
);

const icons = {
  [ANGI_ARCHITECTURE]: (
    <Tooltip content={ANGI_TOOLTIP_MESSAGE} place="bottom">
      <EOS_STAR className="mr-1 fill-jungle-green-500" />
    </Tooltip>
  ),
  [CLASSIC_ARCHITECTURE]: (
    <Tooltip
      content={CLASSIC_TOOLTIP_MESSAGE}
      place="bottom"
      className="whitespace-pre"
    >
      <EOS_INFO_OUTLINED className="mr-1" />
    </Tooltip>
  ),
};

function ClusterTypeLabel({ clusterType, clusterScenario, architectureType }) {
  const clusterTypeLabel = getClusterTypeLabel(clusterType);
  const clusterScenarioLabel = getClusterScenarioLabel(clusterScenario);
  const clusterLabel = `${clusterTypeLabel} ${clusterScenarioLabel}`;

  return (
    <span className="group flex items-center relative">
      {icons[architectureType]}
      {clusterLabel}
    </span>
  );
}

export default ClusterTypeLabel;
