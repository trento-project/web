import React, { useState } from 'react';
import {
  EOS_SHIELD_OUTLINED,
  EOS_CRITICAL_BUG_OUTLINED,
  EOS_ADD_BOX_OUTLINED,
} from 'eos-icons-react';
import { format as formatDate } from 'date-fns';
import classNames from 'classnames';
import { noop } from 'lodash';

import Button from '@common/Button';
import Table, {
  createStringSortingPredicate,
  createDateSortingPredicate,
} from '@common/Table';
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
  const [sortingColumn, setSortingColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const toggleSortDirection = () => {
    if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortDirection('asc');
    }
  };

  const createOnClickHandler = (key) => () => {
    if (sortingColumn === key) {
      toggleSortDirection();
    } else {
      setSortDirection('asc');
    }
    setSortingColumn(key);
  };

  const handleNameColClick = createOnClickHandler('advisory_name');
  const handleSynopsisColClick = createOnClickHandler('advisory_synopsis');
  const handleUpdateDateColClick = createOnClickHandler('update_date');

  const sortByAdvisoryName = createStringSortingPredicate(
    'advisory_name',
    sortDirection
  );
  const sortByLatestPackage = createStringSortingPredicate(
    'advisory_synopsis',
    sortDirection
  );
  const sortByUpdateDate = createDateSortingPredicate(
    'update_date',
    sortDirection
  );

  const columnToSortingFunc = {
    advisory_name: sortByAdvisoryName,
    advisory_synopsis: sortByLatestPackage,
    update_date: sortByUpdateDate,
  };

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
        sortable: true,
        sortDirection: sortingColumn === 'advisory_name' ? sortDirection : null,
        handleClick: handleNameColClick,
        render: (content) => (
          <Button type="link" size="fit" onClick={() => onNavigate(content)}>
            {content}
          </Button>
        ),
      },
      {
        title: 'Synopsis',
        key: 'advisory_synopsis',
        sortable: true,
        sortDirection:
          sortingColumn === 'advisory_synopsis' ? sortDirection : null,
        handleClick: handleSynopsisColClick,
      },
      {
        title: 'Updated',
        key: 'update_date',
        sortable: true,
        sortDirection: sortingColumn === 'update_date' ? sortDirection : null,
        handleClick: handleUpdateDateColClick,
        render: (content, _) => formatDate(content, 'd MMM y'),
      },
    ],
  };

  return (
    <Table
      className="pt-2"
      config={patchListConfig}
      data={patches}
      sortBy={columnToSortingFunc[sortingColumn]}
    />
  );
}
