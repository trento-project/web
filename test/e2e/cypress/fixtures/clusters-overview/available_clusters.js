export const availableClusters = [
  {
    id: '8a66f8fb-5fe9-51b3-a34c-24321271a4e3',
    name: 'drbd_cluster',
    sid: '',
    type: 'Unknown',
  },
  {
    id: '6bd7ec60-8cb1-5c6b-a892-29e1fd2f8380',
    name: 'drbd_cluster',
    sid: '',
    type: 'Unknown',
  },
  {
    id: 'c7a1e943-bf46-590b-bd26-bfc7c78def97',
    name: 'drbd_cluster',
    sid: '',
    type: 'Unknown',
  },
  {
    id: '7965f822-0254-5858-abca-f6e8b4c27714',
    name: 'hana_cluster_1',
    sid: 'HDD',
    type: 'HANA Scale Up',
  },
  {
    id: 'fa0d74a3-9240-5d9e-99fa-61c4137acf81',
    name: 'hana_cluster_2',
    sid: 'HDQ',
    type: 'HANA Scale Up',
  },
  {
    id: '469e7be5-4e20-5007-b044-c6f540a87493',
    name: 'hana_cluster_3',
    sid: 'HDP',
    type: 'HANA Scale Up',
  },
  {
    id: '0eac831a-aa66-5f45-89a4-007fbd2c5714',
    name: 'netweaver_cluster',
    sid: 'NWP',
    type: 'ASCS/ERS',
  },
  {
    id: '5284f376-c1f4-5178-8966-d490df3dab4f',
    name: 'netweaver_cluster',
    sid: 'NWD',
    type: 'ASCS/ERS',
  },
  {
    id: 'fb861bce-d212-56b5-8786-74afd6eb58cb',
    name: 'netweaver_cluster',
    sid: 'NWQ',
    type: 'ASCS/ERS',
  },
];

export const healthyClusterScenario = {
  clusterName: 'hana_cluster_2',
  checks: ['156F64'],
  hostIds: [
    '99cf8a3a-48d6-57a4-b302-6e4482227ab6',
    'e0c182db-32ff-55c6-a9eb-2b82dd21bc8b',
  ],
  result: 'passing',
  executionId: '8d840ba1-828f-4cb8-bce0-6e34224fe4f8',
};

export const unhealthyClusterScenario = {
  clusterName: 'hana_cluster_3',
  checks: ['156F64'],
  hostIds: [
    '9cd46919-5f19-59aa-993e-cf3736c71053',
    'b767b3e9-e802-587e-a442-541d093b86b9',
  ],
  result: 'critical',
  executionId: '8d840ba1-828f-4cb8-bce0-6e34224fe4f9',
};
