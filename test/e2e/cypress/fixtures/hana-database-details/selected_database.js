export const selectedDatabase = {
  Id: 'f534a4ad-cef7-5234-b196-e67082ffb50c',
  Sid: 'HDD',
  Type: 'HANA Database',
  SystemReplication: 'True',
  Sites: [
    {
      Name: 'NBG',
      SystemReplication: 'PRIMARY',
      Tier: '1',
      Status: 'ACTIVE',
      Replicating: null,
      ReplicationMode: null,
      OperationMode: null,
    },
    {
      Name: 'WDF',
      SystemReplication: 'SECONDARY',
      Tier: '2',
      Status: null,
      Replicating: 'NBG',
      ReplicationMode: 'sync',
      OperationMode: 'logreplay',
    },
  ],
  Hosts: [
    {
      Hostname: 'vmhdbdev02',
      Instance: '10',
      Features: 'HDB|HDB_WORKER',
      HttpPort: '51013',
      HttpsPort: '51014',
      StartPriority: '0.3',
      Status: 'Green',
    },
    {
      Hostname: 'vmhdbdev01',
      Instance: '10',
      Features: 'HDB|HDB_WORKER',
      HttpPort: '51013',
      HttpsPort: '51014',
      StartPriority: '0.3',
      Status: 'Green',
    },
  ],
};

export const attachedHosts = [
  {
    Name: 'vmhdbdev02',
    AgentId: '0a055c90-4cb6-54ce-ac9c-ae3fedaf40d4',
    Addresses: ['10.100.1.12'],
    Provider: 'Azure',
    Cluster: 'hana_cluster',
    ClusterId: '7965f822-0254-5858-abca-f6e8b4c27714',
    Version: '2.1.0',
  },
  {
    Name: 'vmhdbdev01',
    AgentId: '13e8c25c-3180-5a9a-95c8-51ec38e50cfc',
    Addresses: ['10.100.1.11', '10.100.1.13'],
    Provider: 'Azure',
    Cluster: 'hana_cluster',
    ClusterId: '7965f822-0254-5858-abca-f6e8b4c27714',
    Version: '2.1.0',
  },
];
