import React from 'react';
import { EOS_WARNING_OUTLINED } from 'eos-icons-react';

import Tooltip from '@common/Tooltip';
import { Link } from 'react-router';

import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';

const TOOLTIPS = {
  [APPLICATION_TYPE]: 'SAP system currently not registered',
  [DATABASE_TYPE]: 'HANA database currently not registered',
};

const buildHref = (id, type) =>
  `/${type === APPLICATION_TYPE ? 'sap_systems' : 'databases'}/${id}`;

const renderTooltip = (type) =>
  TOOLTIPS[type] ?? 'System currently not registered';

function SapSystemLink({ systemType, sapSystemId, children }) {
  return sapSystemId && systemType ? (
    <Link
      className="text-jungle-green-500 hover:opacity-75"
      to={buildHref(sapSystemId, systemType)}
    >
      {children}
    </Link>
  ) : (
    <Tooltip content={renderTooltip(systemType)} place="bottom">
      <span className="group flex items-center relative">
        <EOS_WARNING_OUTLINED
          size="base"
          className="centered fill-yellow-500"
        />
        <span className="ml-1 truncate max-w-[100px]">{children}</span>
      </span>
    </Tooltip>
  );
}

export default SapSystemLink;
