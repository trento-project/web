import React, { useState, useEffect } from 'react';

import { logError } from '@lib/log';
import { getAboutPageData } from '@lib/api/about';

import ListView from '@components/ListView';
import Pill from '@components/Pill';

import AboutPageLogo from './AboutPageLogo';
import AboutPageText from './AboutPageText';

const AboutPage = ({ onFetch = getAboutPageData }) => {
  const [flavor, setFlavor] = useState('N/A');
  const [subscriptions, setSubscriptions] = useState(0);
  const [version, setVersion] = useState('v0.0.0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    onFetch()
      .then(({ data: { flavor, version, sles_subscriptions } }) => {
        setLoading(false);
        undefined !== flavor && setFlavor(flavor);
        setVersion(version);
        setSubscriptions(sles_subscriptions);
      })
      .catch((error) => {
        logError(error);
        setLoading(false);
      });
  }, []);

  const listViewData = [
    {
      title: 'Trento flavor',
      content: loading ? 'Loading...' : flavor,
    },
    {
      title: 'Server version',
      content: loading ? 'Loading...' : version,
    },
    {
      title: 'GitHub repository',
      content: 'https://github.com/trento-project/web',
      render: (content) => <a href={content}>{content}</a>,
    },
    {
      title: 'SLES for SAP subscriptions',
      content: `${subscriptions} found`,
      render: (content) =>
        loading ? <span>Loading...</span> : <Pill>{content}</Pill>,
    },
  ];

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg">
      <div className="grid gap-16 lg:grid-cols-3">
        <div className="divide-y divide-dashed col-span-3 lg:col-span-2 lg:pr-10">
          <AboutPageText />
          <div className="pt-5">
            <ListView
              className="text-sm"
              orientation="horizontal"
              data={listViewData}
            />
          </div>
        </div>
        <AboutPageLogo />
      </div>
    </div>
  );
};

export default AboutPage;
