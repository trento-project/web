const availableClusters = [
  ['8a66f8fb-5fe9-51b3-a34c-24321271a4e3', 'drbd_cluster'],
  ['6bd7ec60-8cb1-5c6b-a892-29e1fd2f8380', 'drbd_cluster'],
  ['c7a1e943-bf46-590b-bd26-bfc7c78def97', 'drbd_cluster'],
  ['7965f822-0254-5858-abca-f6e8b4c27714', 'hana_cluster_1'],
  ['fa0d74a3-9240-5d9e-99fa-61c4137acf81', 'hana_cluster_2'],
  ['469e7be5-4e20-5007-b044-c6f540a87493', 'hana_cluster_3'],
  ['5284f376-c1f4-5178-8966-d490df3dab4f', 'netweaver_cluster'],
  ['fb861bce-d212-56b5-8786-74afd6eb58cb', 'netweaver_cluster'],
  ['0eac831a-aa66-5f45-89a4-007fbd2c5714', 'netweaver_cluster'],
];

export const allClusterNames = () =>
  availableClusters.map(([_, clusterName]) => clusterName);
export const allClusterIds = () =>
  availableClusters.map(([clusterId, _]) => clusterId);
export const clusterIdByName = (clusterName) =>
  availableClusters.find(([, name]) => name === clusterName)[0];
export const clusterNameById = (clusterId) =>
  availableClusters.find(([id]) => id === clusterId)[1];
