import React from 'react';
import {
  EOS_SHIELD_OUTLINED,
  EOS_CRITICAL_BUG_OUTLINED,
  EOS_ADD_BOX_OUTLINED,
} from 'eos-icons-react';
import { format as formatDate } from 'date-fns';
import classNames from 'classnames';
import { noop } from 'lodash';

import Table from '@common/Table';
import { computedIconCssClass } from '@lib/icon';

const iconFromAdvisoryType = (
  advisoryType,
  centered = false,
  hoverOpacity = true,
  size = 'l'
) => {
  const hoverOpacityClassName = {
    'hover:opacity-75': hoverOpacity,
    'hover:opacity-100': !hoverOpacity,
  };

  switch (advisoryType) {
    case 'security_advisory':
      return (
        <EOS_SHIELD_OUTLINED
          className={classNames(
            hoverOpacityClassName,
            computedIconCssClass('fill-red-500', centered)
          )}
          size={size}
        />
      );
    case 'bugfix':
      return (
        <EOS_CRITICAL_BUG_OUTLINED
          className={classNames(
            hoverOpacityClassName,
            computedIconCssClass('fill-yellow-500', centered)
          )}
          size={size}
        />
      );
    case 'enhancement':
      return (
        <EOS_ADD_BOX_OUTLINED
          className={classNames(
            hoverOpacityClassName,
            computedIconCssClass('fill-yellow-500', centered)
          )}
          size={size}
        />
      );
    default:
      return null;
  }
};

export default function PatchList({ patches, onNavigate = noop }) {
  const patchListConfig = {
    usePadding: false,
    pagination: true,
    columns: [
      {
        title: 'Type',
        key: 'advisory_type',
        render: (content, _) => iconFromAdvisoryType(content),
      },
      {
        title: 'Advisory',
        key: 'advisory_name',
        render: (content, item) => (
          <button
            type="button"
            className="text-jungle-green-500 hover:opacity-75"
            onClick={() => onNavigate(item)}
          >
            {content}
          </button>
        ),
      },
      {
        title: 'Synopsis',
        key: 'advisory_synopsis',
      },
      {
        title: 'Updated',
        key: 'update_date',
        render: (content, _) => formatDate(content, 'd MMM y'),
      },
    ],
  };

  return <Table config={patchListConfig} data={patches} />;
}
