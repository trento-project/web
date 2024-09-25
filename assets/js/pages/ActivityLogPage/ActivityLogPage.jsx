import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { map, pipe } from 'lodash/fp';

import { getActivityLog } from '@lib/api/activityLogs';
import { allowedActivities } from '@lib/model/activityLog';
import { getActivityLogUsers } from '@state/selectors/activityLog';
import { getUserProfile } from '@state/selectors/user';

import PageHeader from '@common/PageHeader';
import ActivityLogOverview from '@common/ActivityLogOverview';
import ComposedFilter from '@common/ComposedFilter';
import {
  PaginationPrevNext,
  defaultItemsPerPageOptions,
} from '@common/Pagination';

import {
  applyItemsPerPage,
  setFilterValueToSearchParams,
  searchParamsToAPIParams,
  searchParamsToFilterValue,
  getItemsPerPageFromSearchParams,
  setPaginationToSearchParams,
  resetPaginationToSearchParams,
} from './searchParams';

const emptyResponse = { data: [] };

const defaultItemsPerPage = 20;
const detectItemsPerPage = (number) =>
  defaultItemsPerPageOptions.includes(number) ? number : defaultItemsPerPage;
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
const applyDefaultItemsPerPage = (params) =>
  'first' in params || 'last' in params
    ? params
    : { first: defaultItemsPerPage, ...params };

const activityLogRequest = pipe(
  searchParamsToAPIParams,
  applyDefaultItemsPerPage,
  getActivityLog
);

function ActivityLogPage() {
  const users = useSelector(getActivityLogUsers);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activityLogResponse, setActivityLogResponse] = useState(emptyResponse);
  const [isLoading, setLoading] = useState(true);
  const [activityLogDetailModalOpen, setActivityLogDetailModalOpen] =
    useState(false);
  const { abilities } = useSelector(getUserProfile);

  const filters = [
    {
      key: 'metadata',
      type: 'search_input',
      title: 'Metadata',
    },
    {
      key: 'type',
      type: 'select',
      title: 'Resource type',
      options: pipe(
        allowedActivities,
        map(([key, value]) => [key, value.label])
      )(abilities),
    },
    {
      key: 'actor',
      type: 'select',
      title: 'User',
      options: users,
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

  const itemsPerPage = pipe(
    getItemsPerPageFromSearchParams,
    detectItemsPerPage
  )(searchParams);

  const fetchActivityLog = () => {
    setLoading(true);

    activityLogRequest(searchParams)
      .then(({ data }) => {
        setActivityLogResponse({
          data: data?.data || [],
          pagination: data?.pagination,
        });
      })
      .catch(() => setActivityLogResponse(emptyResponse))
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
              resetPaginationToSearchParams,
              applyItemsPerPage(itemsPerPage),
              setSearchParams
            )}
          />
        </div>
        <ActivityLogOverview
          activityLogDetailModalOpen={activityLogDetailModalOpen}
          activityLog={activityLogResponse.data}
          loading={isLoading}
          onActivityLogEntryClick={() => setActivityLogDetailModalOpen(true)}
          onCloseActivityLogEntryDetails={() =>
            setActivityLogDetailModalOpen(false)
          }
        />
        <PaginationPrevNext
          hasPrev={activityLogResponse.pagination?.has_previous_page}
          hasNext={activityLogResponse.pagination?.has_next_page}
          currentItemsPerPage={itemsPerPage}
          onSelect={pipe(
            (selection) => {
              switch (selection) {
                case 'prev':
                  return {
                    last: itemsPerPage,
                    before: activityLogResponse.pagination?.start_cursor,
                  };
                case 'next':
                  return {
                    first: itemsPerPage,
                    after: activityLogResponse.pagination?.end_cursor,
                  };
                case 'first':
                  return { first: itemsPerPage };
                case 'last':
                  return { last: itemsPerPage };
                default:
                  return {};
              }
            },
            setPaginationToSearchParams(searchParams),
            setSearchParams
          )}
          onChangeItemsPerPage={pipe(
            changeItemsPerPage(searchParams),
            setPaginationToSearchParams(searchParams),
            setSearchParams
          )}
        />
      </div>
    </>
  );
}

export default ActivityLogPage;
