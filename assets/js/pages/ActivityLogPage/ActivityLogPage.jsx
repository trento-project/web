import React, { useState, useEffect } from 'react';
import { noop } from 'lodash';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { EOS_REFRESH, EOS_UPDATE_FILLED } from 'eos-icons-react';

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
import Select, { createOptionRenderer } from '@common/Select';

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
import {
  addRefreshRateToSearchParams,
  detectRefreshRate,
  refreshRateOptions,
  refreshRateOptionsToLabel,
  removeRefreshRateFromSearchParams,
  resetAutorefresh,
} from './autorefresh';

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

function RefreshIntervalSelection({ disabled = false, rate, onChange = noop }) {
  const [refreshRate, setRefreshRate] = pipe(detectRefreshRate, useState)(rate);

  return (
    <Select
      disabled={disabled}
      optionsName="refresh-rate"
      options={refreshRateOptions}
      value={refreshRate}
      renderOption={createOptionRenderer(null, (value) => (
        <span className="text-center block">
          {refreshRateOptionsToLabel[value]}
        </span>
      ))}
      onChange={(newRefreshRate) => {
        setRefreshRate(newRefreshRate);
        onChange(newRefreshRate);
      }}
      selectedItemPrefix={<EOS_UPDATE_FILLED className="absolute" />}
    />
  );
}

function ActivityLogPage() {
  const users = useSelector(getActivityLogUsers);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activityLogRequest, setActivityLogRequest] = useState(
    request.initial()
  );
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [autorefreshInterval, setAutorefreshInterval] = useState(null);
  const { abilities } = useSelector(getUserProfile);

  const filters = [
    {
      key: 'search',
      title: 'Search',
      type: 'search_box',
      name: 'metadata-search',
      placeholder: 'Filter by metadata',
      allowClear: true,
      className: 'col-span-8',
    },
    {
      key: 'type',
      type: 'select',
      title: 'Type',
      options: pipe(
        allowedActivities,
        map(([key, value]) => [key, value.label])
      )(abilities),
      className: 'col-span-2 min-w-full max-w-44',
    },
    {
      key: 'actor',
      type: 'select',
      title: 'User',
      options: users,
      className: 'col-span-2',
    },
    {
      key: 'to_date',
      title: 'newer than',
      type: 'date',
      prefilled: true,
      className: 'col-span-2',
    },
    {
      key: 'from_date',
      title: 'older than',
      type: 'date',
      prefilled: true,
      className: 'col-span-2',
    },
  ];

  const itemsPerPage = pipe(
    getItemsPerPageFromSearchParams,
    detectItemsPerPage
  )(searchParams);

  const trackWhetherOnFirstPage = (response) => {
    setIsFirstPage(!response?.pagination?.has_previous_page);
    return response;
  };

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
          trackWhetherOnFirstPage,
          request.success,
          setActivityLogRequest
        )
      )
      .catch(pipe(request.failure, setActivityLogRequest))
      .finally(() => clearTimeout(tid));
  };

  const keepAutorefreshRate = (currentRate) => (params) =>
    currentRate ? addRefreshRateToSearchParams(params, currentRate) : params;

  useEffect(() => fetchActivityLog(), [searchParams]);

  useEffect(() => {
    if (!isFirstPage) return noop;

    const { interval, cleanup } = resetAutorefresh(
      autorefreshInterval,
      fetchActivityLog,
      searchParams.get('refreshRate')
    );

    setAutorefreshInterval(interval);

    return cleanup;
  }, [isFirstPage, searchParams]);

  const currentRefreshRate = searchParams.get('refreshRate');

  return (
    <>
      <PageHeader className="font-bold">Activity Log</PageHeader>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <ComposedFilter
            className="grid-rows-2"
            filters={filters}
            autoApply={false}
            value={searchParamsToFilterValue(searchParams)}
            onChange={pipe(
              setFilterValueToSearchParams,
              resetPaginationToSearchParams,
              applyItemsPerPage(itemsPerPage),
              keepAutorefreshRate(currentRefreshRate),
              setSearchParams
            )}
          >
            <RefreshIntervalSelection
              disabled={!isFirstPage}
              rate={currentRefreshRate}
              onChange={pipe(
                (newRefreshRate) =>
                  newRefreshRate === 'off'
                    ? removeRefreshRateFromSearchParams(searchParams)
                    : addRefreshRateToSearchParams(
                        searchParams,
                        newRefreshRate
                      ),
                setSearchParams
              )}
            />
            <Button type="primary-white" onClick={fetchActivityLog}>
              <EOS_REFRESH className="inline-block fill-jungle-green-500" />{' '}
              Refresh
            </Button>
          </ComposedFilter>
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
