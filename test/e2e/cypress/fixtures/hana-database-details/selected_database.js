export const selectedDatabase = {
  Id: 'f534a4ad-cef7-5234-b196-e67082ffb50c',
  Sid: 'HDD',
  Type: 'HANA Database',
  Hosts: [
    {
      Hostname: 'vmhdbdev02',
      Instance: '10',
      Features: 'HDB|HDB_WORKER',
      HttpPort: '51013',
      HttpsPort: '51014',
      StartPriority: '0.3',
      Status: 'SAPControl-GREEN',
      StatusBadge: 'GREEN',
    },
    {
      Hostname: 'vmhdbdev01',
      Instance: '10',
      Features: 'HDB|HDB_WORKER',
      HttpPort: '51013',
      HttpsPort: '51014',
      StartPriority: '0.3',
      Status: 'SAPControl-GREEN',
      StatusBadge: 'GREEN',
    },
  ],
};

export const attachedHosts = [
  {
    Name: 'vmhdbdev02',
    AgentId: '0a055c90-4cb6-54ce-ac9c-ae3fedaf40d4',
    Addresses: ['10.100.1.12'],
    Provider: 'azure',
    Cluster: 'hana_cluster',
    ClusterId: '7965f822-0254-5858-abca-f6e8b4c27714',
    Version: '1.1.0+git.dev17.1660137228.fe5ba8a',
  },
  {
    Name: 'vmhdbdev01',
    AgentId: '13e8c25c-3180-5a9a-95c8-51ec38e50cfc',
    Addresses: ['10.100.1.11', '10.100.1.13'],
    Provider: 'azure',
    Cluster: 'hana_cluster',
    ClusterId: '7965f822-0254-5858-abca-f6e8b4c27714',
    Version: '1.1.0+git.dev17.1660137228.fe5ba8a',
  },
];
