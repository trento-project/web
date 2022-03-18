import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Table from './Table';
import Tags from './Tags';

import { useSelector } from 'react-redux';

import { EOS_LENS_FILLED } from 'eos-icons-react';

const getHeartbeatIcon = ({ heartbeat }) => {
  switch (heartbeat) {
    case 'passing':
      return <EOS_LENS_FILLED className="fill-jungle-green-500" />;
    case 'critical':
      return <EOS_LENS_FILLED className="fill-red-500" />;
    default:
      return <EOS_LENS_FILLED className="fill-gray-500" />;
  }
};

const addTag = (tag, hostId) => {
  axios
    .post(`/api/hosts/${hostId}/tags`, {
      value: tag,
      resource_type: 'host',
    })
    .catch((error) => {
      console.err('Error posting tag: ', error);
    });
};

const removeTag = (tag, hostId) => {
  axios.delete(`/api/hosts/${hostId}/tags/${tag}`).catch((error) => {
    console.err('Error deleting tag: ', error);
  });
};

const HostsList = () => {
  const hosts = useSelector((state) => state.hostsList.hosts);

  const config = {
    columns: [
      {
        title: 'Health',
        key: 'health',
        render: (_content, item) => (
          <div className="ml-4">{getHeartbeatIcon(item)}</div>
        ),
      },
      {
        title: 'Hostname',
        key: 'hostname',
        render: (content, { id }) => (
          <span className="transition hover:text-green-600">
            <Link to={`/hosts/${id}`}>{content}</Link>
          </span>
        ),
      },
      {
        title: 'IP',
        key: 'ip',
        render: (content) =>
          content.map((ip) => (
            <div key={ip} className="text-sm text-gray-900">
              {ip}
            </div>
          )),
      },
      {
        title: 'Provider',
        key: 'provider',
      },
      {
        title: 'Agent version',
        key: 'agent_version',
        render: (content) => (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            {content}
          </span>
        ),
      },
      {
        title: 'Tags',
        key: 'tags',
        render: (content, item) => (
          <Tags
            tags={content}
            onChange={() => {}}
            onAdd={(tag) => addTag(tag, item.id)}
            onRemove={(tag) => removeTag(tag, item.id)}
          />
        ),
      },
    ],
  };

  const data = hosts.map((host) => {
    return {
      heartbeat: host.heartbeat,
      hostname: host.hostname,
      ip: host.ip_addresses,
      provider: host.provider,
      agent_version: host.agent_version,
      id: host.id,
      tags: (host.tags && host.tags.map((tag) => tag.value)) || [],
    };
  });

  return <Table config={config} data={data} />;
};

export default HostsList;
