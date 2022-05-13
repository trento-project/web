export const healthMap = {
  GREEN: 'bg-jungle-green-500',
  YELLOW: 'bg-yellow-500',
  RED: 'bg-red-500',
  GRAY: 'bg-gray-500',
};

export const selectedSystem = {
  Id: 'f534a4ad-cef7-5234-b196-e67082ffb50c',
  Sid: 'NWD',
  Type: 'Application server',
  Hosts: [
    {
      Hostname: 'sapnwdas',
      Instance: '00',
      Features: 'MESSAGESERVER|ENQUE',
      HttpPort: '50013',
      HttpsPort: '50014',
      StartPriority: '1',
      Status: 'SAPControl-GREEN',
      StatusBadge: 'GREEN',
    },
    {
      Hostname: 'sapnwdpas',
      Instance: '01',
      Features: 'ABAP|GATEWAY|ICMAN|IGS',
      HttpPort: '50113',
      HttpsPort: '50114',
      StartPriority: '3',
      Status: 'SAPControl-GREEN',
      StatusBadge: 'GREEN',
    },
    {
      Hostname: 'sapnwdaas1',
      Instance: '02',
      Features: 'ABAP|GATEWAY|ICMAN|IGS',
      HttpPort: '50213',
      HttpsPort: '50214',
      StartPriority: '3',
      Status: 'SAPControl-GREEN',
      StatusBadge: 'GREEN',
    },
    {
      Hostname: 'sapnwder',
      Instance: '10',
      Features: 'ENQREP',
      HttpPort: '51013',
      HttpsPort: '51014',
      StartPriority: '0.5',
      Status: 'SAPControl-GREEN',
      StatusBadge: 'GREEN',
    },
  ],
};

export const attachedHosts = [
  {
    Name: 'vmnwdev01',
    AgentId: '7269ee51-5007-5849-aaa7-7c4a98b0c9ce',
    Addresses: ['10.100.1.21', '10.100.1.25'],
    Provider: 'azure',
    Cluster: 'netweaver_cluster',
    Version: '0.7.1+git.dev42.1640084952.33229fc',
  },
  {
    Name: 'vmnwdev03',
    AgentId: '9a3ec76a-dd4f-5013-9cf0-5eb4cf89898f',
    Addresses: ['10.100.1.23', '10.100.1.27'],
    Provider: 'azure',
    Cluster: '',
    Version: '0.7.1+git.dev42.1640084952.33229fc',
  },
  {
    Name: 'vmnwdev04',
    AgentId: '1b0e9297-97dd-55d6-9874-8efde4d84c90',
    Addresses: ['10.100.1.24', '10.100.1.28'],
    Provider: 'azure',
    Cluster: '',
    Version: '0.7.1+git.dev42.1640084952.33229fc',
  },
  {
    Name: 'vmnwdev02',
    AgentId: 'fb2c6b8a-9915-5969-a6b7-8b5a42de1971',
    Addresses: ['10.100.1.22', '10.100.1.26'],
    Provider: 'azure',
    Cluster: 'netweaver_cluster',
    Version: '0.7.1+git.dev42.1640084952.33229fc',
  },
];
