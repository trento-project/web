import React from 'react';
import { Link } from 'react-router-dom';
import {
  EOS_SHIELD_OUTLINED,
  EOS_CRITICAL_BUG_OUTLINED,
  EOS_ADD_BOX_OUTLINED,
} from 'eos-icons-react';
import { format as formatDate } from 'date-fns';
import classNames from 'classnames';

import Table from '@common/Table';
import { computedIconCssClass } from '@lib/icon';

function iconFromAdvisoryType(
  advisoryType,
  centered = false,
  hoverOpacity = true,
  size = 'l'
) {
  const hoverOpacityClass = {
    'hover:opacity-75': hoverOpacity,
    'hover:opacity-100': !hoverOpacity,
  };

  switch (advisoryType) {
    case 'security_advisory':
      return (
        <EOS_SHIELD_OUTLINED
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-red-500', centered)
          )}
          size={size}
        />
      );
    case 'bugfix':
      return (
        <EOS_CRITICAL_BUG_OUTLINED
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-yellow-500', centered)
          )}
          size={size}
        />
      );
    case 'enhancement':
      return (
        <EOS_ADD_BOX_OUTLINED
          className={classNames(
            hoverOpacityClass,
            computedIconCssClass('fill-yellow-500', centered)
          )}
          size={size}
        />
      );
    default:
      return null;
  }
}

const patchListConfig = {
  usePadding: false,
  pagination: true,
  columns: [
    {
      title: 'Type',
      key: 'advisory_type',
      render: (content, _) => {
        const PrimaryIcon = iconFromAdvisoryType(content);
        return PrimaryIcon;
      },
    },
    {
      title: 'Advisory',
      key: 'advisory_name',
      render: (content, item) => (
        <Link className="text-jungle-green-500 hover:opacity-75" to={item.url}>
          {content}
        </Link>
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

export default function PatchList({ patches }) {
  return <Table config={patchListConfig} data={patches} />;
}
