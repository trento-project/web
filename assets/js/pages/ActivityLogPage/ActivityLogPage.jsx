import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { EOS_REFRESH } from 'eos-icons-react';

import { map, pipe } from 'lodash/fp';

import { getActivityLog } from '@lib/api/activityLogs';
import * as request from '@lib/api/request';
import { allowedActivities } from '@lib/model/activityLog';
import { getActivityLogUsers } from '@state/selectors/activityLog';
import { getUserProfile } from '@state/selectors/user';

import Button from '@common/Button';
import PageHeader from '@common/PageHeader';
import ActivityLogOverview from '@common/ActivityLogOverview';
import ComposedFilter from '@common/ComposedFilter';
import Pagination, { defaultItemsPerPageOptions } from '@common/Pagination';
import Spinner from '@common/Spinner';

import ConnectionErrorAntenna from '@static/connection-error-antenna.svg';

import NotificationBox from '@common/NotificationBox';
import {
  applyItemsPerPage,
  setFilterValueToSearchParams,
  searchParamsToAPIParams,
  searchParamsToFilterValue,
  getItemsPerPageFromSearchParams,
  setPaginationToSearchParams,
  resetPaginationToSearchParams,
} from './searchParams';

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

const activityLogRequestClient = pipe(
  searchParamsToAPIParams,
  applyDefaultItemsPerPage,
  getActivityLog
);

function MainView({
  request: { status, response },
  itemsPerPage,
  onPageChange,
  onChangeItemsPerPage,
}) {
  if (status === 'initial') {
    return <> </>;
  }
  if (status === 'loading') {
    return (
      <div className="flex flex-row min-h-screen justify-center items-center">
        <Spinner size="xl" />
      </div>
    );
  }
  if (status === 'failure') {
    return (
      <div className="flex justify-center items-center p-10">
        <NotificationBox
          icon={
            <img
              src={ConnectionErrorAntenna}
              className="m-auto w-48"
              alt="Connection error"
            />
          }
          title="Connection Error"
          text="An error occurred while loading the activity log. Please try reloading the page."
        />
      </div>
    );
  }

  const { data, pagination } = response;
  return (
    <>
      <ActivityLogOverview activityLog={data} />
      <Pagination
        className="rounded-b-lg"
        hasPrev={pagination?.has_previous_page}
        hasNext={pagination?.has_next_page}
        currentItemsPerPage={itemsPerPage}
        onSelect={pipe((selection) => {
          switch (selection) {
            case 'prev':
              return {
                last: itemsPerPage,
                before: pagination?.start_cursor,
              };
            case 'next':
              return {
                first: itemsPerPage,
                after: pagination?.end_cursor,
              };
            case 'first':
              return { first: itemsPerPage };
            case 'last':
              return { last: itemsPerPage };
            default:
              return {};
          }
        }, onPageChange)}
        onChangeItemsPerPage={onChangeItemsPerPage}
      />
    </>
  );
}

function ActivityLogPage() {
  const users = useSelector(getActivityLogUsers);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activityLogRequest, setActivityLogRequest] = useState(
    request.initial()
  );
  const { abilities } = useSelector(getUserProfile);

  const filters = [
    {
      key: 'type',
      type: 'select',
      title: 'Type',
      options: pipe(
        allowedActivities,
        map(([key, value]) => [key, value.label])
      )(abilities),
      truncateOptionsContent: false,
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
    // defer the loading state to avoid flickering
    const tid = setTimeout(() => setActivityLogRequest(request.loading()), 500);
    activityLogRequestClient(searchParams)
      .then(
        pipe(
          ({ data }) => ({
            data: data?.data || [],
            pagination: data?.pagination,
          }),
          request.success,
          setActivityLogRequest
        )
      )
      .catch(pipe(request.failure, setActivityLogRequest))
      .finally(() => clearTimeout(tid));
  };

  useEffect(() => {
    fetchActivityLog();
  }, [searchParams]);

  return (
    <>
      <PageHeader className="font-bold">Activity Log</PageHeader>
      <div className="bg-white rounded-lg shadow">
        <div style={{ padding: '1rem' }} />
        <div className="flex items-center px-4 space-x-2 pb-4">
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
          <Button
            type="primary-white"
            className="!w-28"
            onClick={fetchActivityLog}
          >
            <EOS_REFRESH className="inline-block fill-jungle-green-500" />{' '}
            Refresh
          </Button>
        </div>
        <MainView
          request={activityLogRequest}
          itemsPerPage={itemsPerPage}
          onPageChange={pipe(
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
