import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import PageHeader from '@common/PageHeader';
import ActivityLogOverview from '@common/ActivityLogOverview';
import ComposedFilter from '@common/ComposedFilter';

import { getActivityLog } from '@lib/api/activityLogs';
import { ACTIVITY_TYPES_CONFIG } from '@lib/model/activityLog';
import { PaginationPrevNext } from '@common/Pagination/Pagination';
import { pipe } from 'lodash/fp';
import {
  getItemsPerPageFromSearchParams,
  resetPaginationToSearchParams,
  searchParamsToAPIParams,
  searchParamsToFilterValue,
  setFilterValueToSearchParams,
  setPaginationToSearchParams,
} from './searchParams';

const filters = [
  {
    key: 'type',
    type: 'select',
    title: 'Resource type',
    options: Object.entries(ACTIVITY_TYPES_CONFIG).map(([key, value]) => [
      key,
      value.label,
    ]),
  },
  {
    key: 'to_date',
    title: 'newer than',
    type: 'date',
    prefilled: true,
  },
  {
    key: 'from_date',
    title: 'older than',
    type: 'date',
    prefilled: true,
  },
];

const defaultItemsPerPage = 20;
const itemsPerPageOptions = [10, 20, 50, 75, 100];

const changeItemsPerPage = (searchParams) => (items) => {
  if (searchParams.has('after')) {
    return {
      first: items,
      after: searchParams.get('after'),
    };
  }
  if (searchParams.has('before')) {
    return {
      last: items,
      before: searchParams.get('before'),
    };
  }
  return { first: items };
};

function ActivityLogPage() {
  const [searchParams, setSearchParams] = useSearchParams(
    resetPaginationToSearchParams(defaultItemsPerPage)()
  );
  const [activityLog, setActivityLog] = useState([]);
  const [activityLogMetadata, setActivityLogMetadata] = useState({});

  const [isLoading, setLoading] = useState(true);
  const [activityLogDetailModalOpen, setActivityLogDetailModalOpen] =
    useState(false);

  const itemsPerPage = pipe(getItemsPerPageFromSearchParams, (n) =>
    itemsPerPageOptions.includes(n) ? n : itemsPerPageOptions[0]
  )(searchParams);

  const fetchActivityLog = () => {
    setLoading(true);
    const params = searchParamsToAPIParams(searchParams);
    getActivityLog(params)
      .then(({ data: { data = [], ...metadata } = {} }) => {
        setActivityLog(data);
        setActivityLogMetadata(metadata);
      })
      .catch(() => setActivityLog([]))
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchActivityLog();
  }, [searchParams]);

  return (
    <>
      <PageHeader className="font-bold">Activity Log</PageHeader>
      <div className="bg-white rounded-lg shadow">
        <div style={{ padding: '1rem' }} />
        <div className="flex items-center px-4 space-x-4 pb-4">
          <ComposedFilter
            filters={filters}
            autoApply={false}
            value={searchParamsToFilterValue(searchParams)}
            onChange={pipe(
              setFilterValueToSearchParams,
              resetPaginationToSearchParams(itemsPerPage),
              setSearchParams
            )}
          />
        </div>
        <ActivityLogOverview
          activityLogDetailModalOpen={activityLogDetailModalOpen}
          activityLog={activityLog}
          loading={isLoading}
          onActivityLogEntryClick={() => setActivityLogDetailModalOpen(true)}
          onCloseActivityLogEntryDetails={() =>
            setActivityLogDetailModalOpen(false)
          }
        />
        <PaginationPrevNext
          hasPrev={activityLogMetadata.pagination?.has_previous_page}
          hasNext={activityLogMetadata.pagination?.has_next_page}
          currentItemsPerPage={itemsPerPage}
          itemsPerPageOptions={itemsPerPageOptions}
          onSelect={pipe(
            (selection) =>
              selection === 'prev'
                ? {
                    last: itemsPerPage,
                    before: activityLogMetadata.pagination.start_cursor,
                  }
                : {
                    first: itemsPerPage,
                    after: activityLogMetadata.pagination.end_cursor,
                  },
            setPaginationToSearchParams,
            setSearchParams
          )}
          onChangeItemsPerPage={pipe(
            changeItemsPerPage(searchParams),
            setPaginationToSearchParams,
            setSearchParams
          )}
        />
      </div>
    </>
  );
}

export default ActivityLogPage;
