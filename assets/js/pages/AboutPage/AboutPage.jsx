import React, { useState, useEffect } from 'react';

import { logError } from '@lib/log';
import { getAboutData } from '@lib/api/about';

import ListView from '@common/ListView';
import Pill from '@common/Pill';

import AboutPageLogo from './AboutPageLogo';
import AboutPageText from './AboutPageText';

function AboutPage({ onFetch = getAboutData }) {
  const [subscriptions, setSubscriptions] = useState(0);
  const [version, setVersion] = useState('v0.0.0');
  const [wandaVersion, setWandaVersion] = useState(null);
  const [postgresVersion, setPostgresVersion] = useState(null);
  const [rabbitmqVersion, setRabbitmqVersion] = useState(null);
  const [prometheusVersion, setPrometheusVersion] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    onFetch()
      .then(
        ({
          data: {
            version: newVersion,
            sles_subscriptions,
            wanda_version,
            postgres_version,
            rabbitmq_version,
            prometheus_version,
          },
        }) => {
          setLoading(false);
          setVersion(newVersion);
          setSubscriptions(sles_subscriptions);
          setWandaVersion(wanda_version);
          setPostgresVersion(postgres_version);
          setRabbitmqVersion(rabbitmq_version);
          setPrometheusVersion(prometheus_version);
        }
      )
      .catch((error) => {
        logError(error);
        setLoading(false);
      });
  }, []);

  const listViewData = [
    {
      title: 'Server version',
      content: loading ? 'Loading...' : version,
    },
    {
      title: 'Wanda version',
      content: loading ? 'Loading...' : wandaVersion || 'N/A',
    },
    {
      title: 'PostgreSQL version',
      content: loading ? 'Loading...' : postgresVersion || 'N/A',
    },
    {
      title: 'RabbitMQ version',
      content: loading ? 'Loading...' : rabbitmqVersion || 'N/A',
    },
    {
      title: 'Prometheus version',
      content: loading ? 'Loading...' : prometheusVersion || 'N/A',
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
}

export default AboutPage;
