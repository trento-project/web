import React, { useState, useEffect } from 'react';

import TrentoLogo from '../../../static/trento-icon.png';

import { get } from '@lib/network';
import { logError } from '@lib/log';

import ListView from '@components/ListView';
import Pill from '@components/Pill';

const AboutPage = () => {
  const [flavor, setFlavor] = useState('N/A');
  const [subscriptions, setSubscriptions] = useState(0);
  const [version, setVersion] = useState('v0.0.0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    get('/api/about')
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

  return (
    <div className="grid grid-cols-2 gap-16">
      <div className="divide-y divide-dashed">
        <div className="pb-5">
          <h2 className="text-5xl font-bold">About Trento Console</h2>
          <h3 className="text-xl mt-5">
            An open cloud-native web console improving the life of SAP
            Applications administrators
          </h3>
        </div>
        <div className="pt-5">
          <ListView
            className="text-sm"
            orientation="horizontal"
            data={[
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
            ]}
          />
        </div>
      </div>
      <div className="max-w-xs">
        <div className="">
          <img src={TrentoLogo} />
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
