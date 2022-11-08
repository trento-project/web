import React from 'react';

import NotificationBox from '@components/NotificationBox';
import LoadingBox from '@components/LoadingBox';

import { groupBy } from '@lib/lists';

import { EOS_ERROR } from 'eos-icons-react';

import CheckItem from './CheckItem';

const CatalogContainer = ({
  onRefresh = () => {},
  catalogData = [],
  catalogError = null,
  loading = false,
}) => {
  if (loading) {
    return <LoadingBox text="Loading checks catalog..." />;
  }

  if (catalogError) {
    return (
      <NotificationBox
        icon={<EOS_ERROR className="m-auto" color="red" size="xl" />}
        text={catalogError}
        buttonText="Try again"
        buttonOnClick={onRefresh}
      />
    );
  }

  if (catalogData.length === 0) {
    return (
      <NotificationBox
        icon={<EOS_ERROR className="m-auto" color="red" size="xl" />}
        text="Checks catalog is empty."
        buttonText="Try again"
        buttonOnClick={onRefresh}
      />
    );
  }

  return (
    <div>
      {Object.entries(groupBy(catalogData, 'group')).map(
        ([group, checks], idx) => (
          <div
            key={idx}
            className="check-group bg-white shadow overflow-hidden sm:rounded-md mb-8"
          >
            <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {group}
              </h3>
            </div>
            <ul role="list" className="divide-y divide-gray-200">
              {checks.map((check) => (
                <CheckItem
                  key={check.id}
                  checkID={check.id}
                  premium={check.premium}
                  description={check.description}
                  remediation={check.remediation}
                />
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
};

export default CatalogContainer;
