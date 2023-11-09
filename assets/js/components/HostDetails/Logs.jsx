import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { queryOne, getLabelValues } from '@lib/api/logs';
import Button from '@components/Button';
import Table from '@components/Table';
import classNames from 'classnames';
import { EOS_REFRESH } from 'eos-icons-react';
import { set } from 'lodash';

// export const journalDefaultEntries = {
//   'init.scope': {
//     name: 'init.scope',
//   },
//   'k3s.service': {
//     name: 'k3s.service',
//   },
//   'smartd.service': {
//     name: 'smartd.service',
//   },
// };

export const buildJournalEntries = async (setJournalEntries) => {
  const units = await getLabelValues('unit');
  const unitEntries = units.reduce(
    (acc, unit) =>
      set(acc, [unit], {
        name: unit,
        query: (unitValues) =>
          `{unit="${unitValues.name}",hostname="${unitValues.hostname}"}`,
      }),
    {}
  );
  setJournalEntries(unitEntries);
}

export const buildLogFilesEntries = async (setFileLogEntries) => {
  const files = await getLabelValues('filename');
  const logEntries = files.reduce(
    (acc, filename) =>
      set(acc, [filename], {
        name: filename,
        query: (fileValues) =>
          `{job="my-logs",filename="${filename}", hostname="${fileValues.hostname}"}`,
      }),
    {}
  );
  setFileLogEntries(logEntries);
}

const logsTableConfiguration = {
  usePadding: false,
  columns: [
    {
      title: 'Time',
      key: 'time',
      render: (content) => new Date(content / 1000000).toISOString(),
    },
    {
      title: 'Value',
      key: 'value',
    },
  ],
};

const renderPanel = (query) => <LogsPanel query={query} />;

const buildQuery = (values) =>
  `{unit="${values.name}",hostname="${values.hostname}"}`;

function Logs({ hostname, entries }) {
  return (
    <div className="w-full px-2 sm:px-0">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {Object.keys(entries).map((entry) => (
            <Tab
              key={entry}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
                  'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              {entry}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {Object.values(entries).map(
            ({ name, render = renderPanel, query = buildQuery }) => (
              <Tab.Panel
                key={name}
                unmount={false}
                className={classNames(
                  'rounded-xl bg-white p-3',
                  'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                )}
              >
                {render(query({ name, hostname }))}
              </Tab.Panel>
            )
          )}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

function LogsPanel({ query }) {
  const [logs, setLogs] = useState([]);

  return (
    <>
      <Table config={logsTableConfiguration} data={logs} withPadding={false} />
      <Button
        syze="small"
        type="default-fit"
        className="mt-3"
        onClick={async () => {
          const newLogs = await queryOne(query);
          setLogs(newLogs);
        }}
      >
        <EOS_REFRESH className="fill-white" />
      </Button>
    </>
  );
}

export default Logs;
